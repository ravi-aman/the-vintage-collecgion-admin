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
