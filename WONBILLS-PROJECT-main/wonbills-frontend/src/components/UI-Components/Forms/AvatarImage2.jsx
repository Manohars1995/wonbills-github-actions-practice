import React, { useRef, useState, useCallback, useId } from "react";
import { MdCloudUpload } from "react-icons/md";
import { postImageToS3Bucket } from "../../../services/shared/shared";
import { showToast } from "../../UI-Elements/Toast";

const MAX_FILE_SIZE_MB = 5;

const AvtarImage2 = ({ value, onChangeVal, title = "" }) => {
    const fileInputRef = useRef(null);
    const inputId = useId();
    const [uploading, setUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState("");

    const validateFile = (file) => {
        if (!file.type.startsWith("image/")) {
            showToast.error("Only image files are allowed");
            return false;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            showToast.error(`Image must be under ${MAX_FILE_SIZE_MB}MB`);
            return false;
        }
        return true;
    };

    const uploadFile = async (file) => {
        if (!validateFile(file)) return;

        setUploading(true);
        try {
            const response = await postImageToS3Bucket(file);
            if (response?.data?.success) {
                onChangeVal(response.data.data, true);
            } else {
                showToast.error("Upload failed");
                onChangeVal("", false);
            }
        } catch {
            showToast.error("Upload failed");
            onChangeVal("", false);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLocalPreview(URL.createObjectURL(file));
        uploadFile(file);
    };

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            if (uploading) return;
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            setLocalPreview(URL.createObjectURL(file));
            uploadFile(file);
        },
        [uploading]
    );

    const previewSrc = localPreview || value;

    return (
        <div className="w-full max-w-full">
            <div
                className="
                    flex flex-col sm:flex-row
                    gap-4
                    p-3 sm:p-4
                    rounded-3xl
                    bg-white
                    border-2 border-dashed border-gray-200
                    w-full
                "
            >
                {/* PREVIEW */}
                <div className="flex justify-center sm:justify-start shrink-0">
                    <div
                        className="
                            w-43 h-30
                            sm:w-40 sm:h-28
                            md:w-44 md:h-32
                            rounded-2xl
                            border-2 border-gray-300
                            bg-gray-50
                            flex items-center justify-center
                            overflow-hidden
                        "
                        style={{
                            backgroundImage: previewSrc ? `url(${previewSrc})` : "none",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                        }}
                    >
                        {!previewSrc && !uploading && (
                            <span className="text-[11px] text-gray-400 text-center px-2">
                                No {title} uploaded
                            </span>
                        )}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                    {/* TITLE */}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {title}
                        </p>
                        <p className="text-xs text-gray-500">
                            Appears on invoices and documents
                        </p>
                    </div>

                    {/* UPLOAD ZONE */}
                    <label
                        htmlFor={inputId}
                        className="
                            w-full
                            flex flex-col sm:flex-row
                            sm:items-center sm:justify-between
                            gap-3
                            px-3 py-3
                            rounded-xl
                            border border-dashed border-gray-300
                            hover:border-blue-400 hover:bg-blue-50/40
                            transition
                            cursor-pointer
                        "
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                <MdCloudUpload className="text-blue-600 text-lg" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                    Upload {title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, WEBP • Max {MAX_FILE_SIZE_MB}MB
                                </p>
                            </div>
                        </div>

                        <span className="text-xs font-semibold text-blue-600 shrink-0">
                            Browse
                        </span>

                        <input
                            ref={fileInputRef}
                            id={inputId}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AvtarImage2;
