"use client";

import { useState } from "react";
import { useAddCategoryMutation } from "../../../redux/features/categoryApi";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import { motion, AnimatePresence } from "framer-motion";

const AddCategoryForm = () => {
    const [addCategory, { isLoading, isError, isSuccess }] = useAddCategoryMutation();
    const [imageFile, setImageFile] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        img: "",
        parent: "",
        children: "",
        productType: "",
        description: "",
        status: "Show",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let imageUrl = formData.img;
        if (imageFile) {
            imageUrl = await uploadToCloudinary(imageFile);
        }

        await addCategory({
            ...formData,
            img: imageUrl,
            children: formData.children.split(",").map((child) => child.trim()),
        });
    };

    return (
        <div className="mt-20 flex items-end justify-end">
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
                Add Category
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg relative"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                            >
                                ✖
                            </button>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Add New Category</h2>

                            {isSuccess && (
                                <p className="text-green-600 bg-green-100 px-4 py-2 rounded-md mb-4 text-center">
                                    ✅ Category added successfully!
                                </p>
                            )}
                            {isError && (
                                <p className="text-red-600 bg-red-100 px-4 py-2 rounded-md mb-4 text-center">
                                    ❌ Error adding category!
                                </p>
                            )}

                            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="p-3 border rounded-lg" />
                                <input type="text" name="parent" placeholder="Parent Category" required value={formData.parent} onChange={handleChange} className="p-3 border rounded-lg" />
                                <input type="text" name="children" placeholder="Children (comma-separated)" value={formData.children} onChange={handleChange} className="p-3 border rounded-lg" />
                                <input type="text" name="productType" placeholder="Product Type" required value={formData.productType} onChange={handleChange} className="p-3 border rounded-lg" />
                                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="p-3 border rounded-lg"></textarea>
                                <select name="status" value={formData.status} onChange={handleChange} className="p-3 border rounded-lg">
                                    <option value="Show">Show</option>
                                    <option value="Hide">Hide</option>
                                </select>
                                <button type="submit" disabled={isLoading} className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400">
                                    {isLoading ? "Adding..." : "Add Category"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddCategoryForm;
