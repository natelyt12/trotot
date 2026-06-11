import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createForumPost, updateForumPost } from "../../services/forumService.js";
import { getRentedRooms } from "../../services/rentedRoomService.js";
import { uploadRoomMedia, getRoomMediaPublicUrl } from "../../services/roomService.js";
import AppIcon from "../common/AppIcon.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";
import { compressImage } from "../../utils/imageUtils.js";

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_FORUM_UPLOAD_PRESET || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Modal tạo / chỉnh sửa bài đăng diễn đàn.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {object|null} user
 * @param {function} onSuccess - gọi sau khi tạo/sửa thành công, nhận post mới
 * @param {object|null} editPost - nếu có → chỉnh sửa bài cũ
 * @param {object|null} preAttachRoom - pre-fill phòng trọ từ MyRoomPage
 */
export default function CreatePostModal({ isOpen, onClose, user, onSuccess, editPost = null, preAttachRoom = null }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();
    const CHARACTER_LIMIT = 1000;

    const [content, setContent] = useState("");
    const [status, setStatus] = useState("published");
    const [category, setCategory] = useState("general");
    const [images, setImages] = useState([]); // { url, public_id, file?, isNew? }
    const [deletedImageIds, setDeletedImageIds] = useState([]);
    const [attachedRoom, setAttachedRoom] = useState(null);
    const [rentedRooms, setRentedRooms] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const isEdit = !!editPost;
    const isTenantOrAdmin = user?.user_metadata?.role === "tenant" || user?.user_metadata?.role === "admin";

    // Init form khi edit
    useEffect(() => {
        if (editPost) {
            setContent(editPost.content || "");
            setStatus(editPost.status || "published");
            setCategory(editPost.category || "general");
            setImages((editPost.images || []).map((img) => ({ id: img.id, url: img.url, public_id: img.public_id })));
            setAttachedRoom(editPost.attachedRoom || null);
            setDeletedImageIds([]);
        } else {
            setContent("");
            setStatus("published");
            setCategory("general");
            setImages([]);
            setAttachedRoom(preAttachRoom || null);
            setDeletedImageIds([]);
        }
    }, [editPost, preAttachRoom, isOpen]);

    // Fetch phòng đang thuê (chỉ tenant/admin)
    useEffect(() => {
        if (!isOpen || !user || !isTenantOrAdmin) return;
        getRentedRooms(user.id).then(({ data }) => {
            const list = data || [];
            setRentedRooms(list);
        });
    }, [isOpen, user, isTenantOrAdmin]);

    if (!isOpen) return null;

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remaining = 3 - images.length;
        if (remaining <= 0) {
            addNotification("Tối đa 3 ảnh mỗi bài đăng.", "error");
            return;
        }
        const toUpload = files.slice(0, remaining);

        setUploading(true);
        try {
            const uploaded = await Promise.all(
                toUpload.map(async (file) => {
                    let compressedFile = file;
                    try {
                        compressedFile = await compressImage(file, 1280, 0.7);
                    } catch (e) {
                        console.error("Error compressing image, uploading original instead:", e);
                    }

                    if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
                        const fd = new FormData();
                        fd.append("file", compressedFile);
                        fd.append("upload_preset", CLOUDINARY_PRESET);
                        fd.append("folder", "forum_posts");
                        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd });
                        if (!res.ok) throw new Error("Upload ảnh Cloudinary thất bại");
                        const data = await res.json();
                        return { url: data.secure_url, public_id: data.public_id, isNew: true };
                    } else {
                        // Fallback to Supabase Storage (just like RoomPostForm.jsx):
                        const sanitizeFilename = (filename) => {
                            const str = filename.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                            return str.replace(/[^a-zA-Z0-9.]/g, "_").replace(/_+/g, "_");
                        };
                        const safeName = sanitizeFilename(compressedFile.name);
                        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${safeName}`;
                        const filePath = `forum_posts/${fileName}`;

                        const { data: _uploadData, error: uploadError } = await uploadRoomMedia(filePath, compressedFile);
                        if (uploadError) throw uploadError;

                        const supabaseUrl = getRoomMediaPublicUrl(filePath);
                        return { url: supabaseUrl, public_id: null, isNew: true };
                    }
                }),
            );
            setImages((prev) => [...prev, ...uploaded]);
        } catch (err) {
            addNotification("Lỗi khi tải ảnh lên: " + err.message, "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (idx) => {
        const img = images[idx];
        if (img.id) setDeletedImageIds((prev) => [...prev, img.id]);
        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (submitStatus = status) => {
        if (!content.trim()) {
            addNotification("Vui lòng nhập nội dung bài đăng.", "error");
            return;
        }
        if (["roommate", "transfer"].includes(category) && !attachedRoom) {
            addNotification("Vui lòng đính kèm phòng trọ cho loại bài đăng này.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const newImages = images.filter((img) => img.isNew);
            const payload = {
                content,
                status: submitStatus,
                roomId: attachedRoom?.id || null,
                category,
                images: newImages,
            };

            let postData;
            if (isEdit) {
                const { error } = await updateForumPost({ postId: editPost.id, ...payload, deletedImageIds });
                if (error) throw error;
                postData = { ...editPost, content, status: submitStatus, room_id: attachedRoom?.id || null, category };
                addNotification("Đã cập nhật bài đăng!", "success");
            } else {
                const { data, error } = await createForumPost({ userId: user.id, ...payload });
                if (error) throw error;
                postData = data;
                addNotification("Đã đăng bài công khai!", "success");
            }
            onSuccess?.(postData, submitStatus);
            onClose();
        } catch (err) {
            addNotification("Lỗi: " + err.message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const userAvatar = user?.user_metadata?.avatar_url;
    const userName = user?.user_metadata?.full_name || "Người dùng";

    // Xác định xem có nên hiện nút gắn phòng trọ không (chỉ hiện khi chưa gắn phòng và có ít nhất 1 phòng để chọn)
    const showAttachButton = !attachedRoom && isTenantOrAdmin && rentedRooms.length > 0;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <h2 className="font-semibold text-stone-900 text-base">{isEdit ? "Chỉnh sửa bài đăng" : "Tạo bài đăng mới"}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer border-none"
                    >
                        <AppIcon name="close" size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* User info & Category */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-medium text-sm shrink-0 overflow-hidden"
                                style={userAvatar ? { backgroundImage: `url(${userAvatar})`, backgroundSize: "cover" } : {}}
                            >
                                {!userAvatar && userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-medium text-stone-900 text-sm">{userName}</div>
                                <div className="text-[10px] text-stone-400 font-normal mt-0.5">Đăng công khai</div>
                            </div>
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-amber-400 transition-colors cursor-pointer"
                        >
                            <option value="general">Thảo luận chung</option>
                            <option value="roommate">Tìm người ở cùng</option>
                            <option value="transfer">Sang nhượng phòng</option>
                        </select>
                    </div>

                    {/* Content textarea */}
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => {
                                if (e.target.value.length <= CHARACTER_LIMIT) {
                                    setContent(e.target.value);
                                }
                            }}
                            placeholder={`${userName} ơi, bạn đang nghĩ gì vậy?`}
                            className="w-full min-h-[120px] text-stone-900 text-[0.95rem] resize-none outline-none border-none placeholder:text-stone-300 leading-relaxed pb-6"
                            autoFocus
                        />
                        <div className="absolute bottom-0 right-0 text-[10px] font-medium text-stone-400 select-none">
                            {content.length} / {CHARACTER_LIMIT}
                        </div>
                    </div>

                    {/* Image preview */}
                    {images.length > 0 && (
                        <div className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                            {images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center cursor-pointer border-none transition-colors"
                                    >
                                        <AppIcon name="close" size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Attach room button */}
                    {showAttachButton && (
                        <button
                            onClick={() => {
                                if (rentedRooms.length > 0) {
                                    const singleRoom = rentedRooms[0].rooms;
                                    if (singleRoom) setAttachedRoom(singleRoom);
                                }
                            }}
                            className="w-full py-2.5 border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 rounded-xl text-amber-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <AppIcon name="home" size={14} />
                            Đính kèm phòng đang thuê
                        </button>
                    )}

                    {/* Attached room */}
                    {attachedRoom && (
                        <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                                {attachedRoom.media_contact?.images?.[0]?.url ? (
                                    <img src={attachedRoom.media_contact.images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                        <AppIcon name="home" size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-medium text-amber-700 uppercase mb-0.5">Phòng đính kèm</div>
                                <div className="text-sm font-medium text-stone-900 line-clamp-1">{attachedRoom.title}</div>
                            </div>
                            {/* Cho phép gỡ đính kèm bất cứ lúc nào */}
                            <button
                                onClick={() => setAttachedRoom(null)}
                                className="text-stone-400 hover:text-stone-600 cursor-pointer border-none bg-transparent shrink-0"
                            >
                                <AppIcon name="close" size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Action toolbar + submit */}
                <div className="border-t border-stone-100 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: toolbar actions */}
                        <div className="flex items-center gap-1">
                            {/* Add image */}
                            <label
                                className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${images.length >= 3 ? "text-stone-300 cursor-not-allowed" : "text-stone-500 hover:bg-stone-100 hover:text-amber-600"}`}
                                title="Thêm ảnh"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={images.length >= 3 || uploading}
                                    className="hidden"
                                />
                                <AppIcon name="photo" size={20} />
                            </label>

                            {/* Attach room (tenant/admin only, only show if user has rented rooms) */}
                            {isTenantOrAdmin && rentedRooms.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (attachedRoom) {
                                            setAttachedRoom(null);
                                        } else if (rentedRooms.length > 0) {
                                            const singleRoom = rentedRooms[0].rooms;
                                            if (singleRoom) setAttachedRoom(singleRoom);
                                        }
                                    }}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors border-none ${attachedRoom ? "bg-amber-100 text-amber-600" : "text-stone-500 hover:bg-stone-100 hover:text-amber-600"}`}
                                    title="Gắn phòng đang thuê"
                                >
                                    <AppIcon name="home" size={20} />
                                </button>
                            )}
                        </div>

                        {/* Right: submit buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleSubmit("published")}
                                disabled={submitting || uploading || !content.trim()}
                                className="px-5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white border-none"
                            >
                                {(submitting || uploading) && (
                                    <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                {isEdit ? "Lưu thay đổi" : "Đăng bài"}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
