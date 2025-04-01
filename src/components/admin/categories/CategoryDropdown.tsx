"use client";

import React, { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import CategoryEditModal from "./CategoryEditModal";
import { useDeleteCategoryMutation } from "../../../redux/features/categoryApi"; // Import the delete mutation

const CategoryDropdown = ({ category }: { category: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // State for confirmation modal

    const [deleteCategory] = useDeleteCategoryMutation(); // Delete category mutation

    // Function to handle the delete action
    const handleDelete = async () => {
        try {
            await deleteCategory(category._id); // Delete the category by ID
            setIsConfirmingDelete(false); // Close the confirmation modal
        } catch (error) {
            console.error("Error deleting category:", error);
            // Optionally show an error message to the user
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                <BsThreeDots className="text-lg" />
            </button>

            {isOpen && (
                <div className="absolute right-0 bg-white shadow-lg rounded-md py-2 w-28">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setIsConfirmingDelete(true)} // Show confirmation modal on delete click
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                    >
                        Delete
                    </button>
                </div>
            )}

            {isEditing && <CategoryEditModal category={category} onClose={() => setIsEditing(false)} />}

            {/* Confirmation Modal */}
            {isConfirmingDelete && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-md p-6">
                        <h3 className="text-xl mb-4">Are you sure you want to delete this category?</h3>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsConfirmingDelete(false)} // Close the confirmation modal
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete} // Confirm delete
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryDropdown;
