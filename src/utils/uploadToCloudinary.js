export const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("image", file); 

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/cloudinary/add-img`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const data = await response.json();

        return data.success ? data.data.url : null;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};


// ✅ Upload multiple images
export const uploadMultipleToCloudinary = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/cloudinary/add-multiple-img`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload images");
        }

        const data = await response.json();
        return data.success ? data.data.urls : []; // Returning an array of URLs
    } catch (error) {
        console.error("Cloudinary Multiple Upload Error:", error);
        return [];
    }
};

// ✅ Delete image
export const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/cloudinary/img-delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: imageUrl }),
        });

        if (!response.ok) {
            throw new Error("Failed to delete image");
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Cloudinary Image Deletion Error:", error);
        return false;
    }
};
