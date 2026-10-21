import { MdOutlineEdit } from "react-icons/md";
import React, { useRef, useState } from "react";
import { FaUserLarge } from "react-icons/fa6";

import { postImageToS3Bucket } from "../../../services/shared/shared"; 
import { showToast } from "../../UI-Elements/Toast";

const AvtarImage = ({ value, onChangeVal, children, title = '' }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {};
    reader.readAsDataURL(file);

    setUploading(true); 
    const startTime = Date.now();

    try {
      const response = await postImageToS3Bucket(file);
      const elapsedTime = Date.now() - startTime;
      const minDuration = 5000; // Minimum wave duration

      const waitRemaining = Math.max(0, minDuration - elapsedTime);

      setTimeout(() => {
        if (response.data.success) {
          const imageUrl = response.data.data;
          onChangeVal(imageUrl, true);
        } else {
          showToast.error("Upload failed");
          onChangeVal("", false);
        }
        setUploading(false);
      }, waitRemaining);

    } catch (err) {
      console.error("Upload error:", err);
      showToast.error("Upload failed");
      onChangeVal("", false);
      setUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        backgroundImage: uploading ? "none" : value ? `url(${value})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
      className="shrink-0 relative bg-black/10 border border-black/40 border-dashed h-32 w-32 rounded-full self-center shadow-lg flex items-center justify-center"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="profile"
      onChange={handleFileChange}
      />

      {/* Default avatar icon */}
      {!uploading && !value && (
        children ? children : <FaUserLarge className="text-gray-400 text-6xl z-0" />
      )}

      {!uploading && (
        <label
          title={title || ''}
          htmlFor="profile"
          className="absolute h-6 w-6 border border-black/50 bottom-3 right-1 bg-gray-400 hover:bg-gray-500 border-dotted flex items-center justify-center p-1 rounded-full shadow cursor-pointer"
        >
          <MdOutlineEdit />
        </label>
      )}

      {uploading && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="wave-loader"></div>
        </div>
      )}
    </div>
  );
};

export default AvtarImage;
