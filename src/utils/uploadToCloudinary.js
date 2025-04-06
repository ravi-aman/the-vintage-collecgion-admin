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
// Upload multiple images to Cloudinary
export const uploadMultipleToCloudinary = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file)); // `images` should match the multer field name in the backend

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/cloudinary/add-multiple-img`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Upload response error:", errorData);
            throw new Error(errorData.message || "Failed to upload images");
        }

        const data = await response.json();

        // Return the array of uploaded images with { url, id }
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Cloudinary Multiple Upload Error:", error);
        return [];
    }
};

// Delete an image from Cloudinary using its public_id
export const deleteImageFromCloudinary = async (public_id) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/cloudinary/img-delete`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ public_id }), // Send the ID, not the full URL
            }
        );

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
