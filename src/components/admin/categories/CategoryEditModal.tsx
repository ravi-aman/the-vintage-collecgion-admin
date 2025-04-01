"use client";

import React, { useState, useEffect } from "react";
import { useUpdateCategoryMutation } from "../../../redux/features/categoryApi";
import { motion } from "framer-motion";

const CategoryEditModal = ({ category, onClose }) => {
    const [formData, setFormData] = useState(category);
    const [updateCategory, { isLoading, isError, isSuccess }] = useUpdateCategoryMutation();

    useEffect(() => {
        setFormData(category);
    }, [category]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        await updateCategory({ id: category._id, data: formData });
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit Category</h2>
                <input type="text" name="parent" value={formData.parent} onChange={handleChange} className="w-full p-2 border rounded mb-3" placeholder="Category Name" />
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded mb-3" placeholder="Description" />
                <input type="text" name="productType" value={formData.productType} onChange={handleChange} className="w-full p-2 border rounded mb-3" placeholder="Product Type" />
                <input type="text" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded mb-3" placeholder="Status" />
                <input type="text" name="img" value={formData.img} onChange={handleChange} className="w-full p-2 border rounded mb-3" placeholder="Image URL" />
                <input type="text" name="children" value={formData.children.join(", ")} onChange={(e) => setFormData({ ...formData, children: e.target.value.split(", ") })} className="w-full p-2 border rounded mb-3" placeholder="Children (comma-separated)" />
                <div className="flex justify-between">
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </div>
                {isSuccess && <p className="text-green-500 mt-2">Category updated successfully!</p>}
                {isError && <p className="text-red-500 mt-2">Error updating category.</p>}
            </div>
        </motion.div>
    );
};

export default CategoryEditModal;
