"use client";

import React, { useState, useEffect } from "react";
import { useUpdateCategoryMutation } from "../../../redux/features/categoryApi";
import { motion, AnimatePresence } from "framer-motion";

const CategoryEditModal = ({ category, onClose }) => {
    const [formData, setFormData] = useState(category);
    const [updateCategory, { isLoading, isError, isSuccess }] = useUpdateCategoryMutation();
    interface FormErrors {
        parent?: string;
        productType?: string;
    }

    const [formErrors, setFormErrors] = useState<FormErrors>({});

    useEffect(() => {
        setFormData(category);
    }, [category]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when field is edited
        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: null });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.parent || formData.parent.trim() === "") {
            formErrors.parent = "Category name is required";
        }
        if (!formData.productType || formData.productType.trim() === "") {
            formErrors.productType = "Product type is required";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                await updateCategory({ id: category._id, data: formData });
                setTimeout(() => {
                    onClose();
                }, 1000); // Close after showing success message
            } catch (error) {
                console.error("Error updating category:", error);
            }
        }
    };

    const formatChildren = (childrenArray) => {
        if (!childrenArray) return "";
        return Array.isArray(childrenArray) ? childrenArray.join(", ") : childrenArray;
    };

    const parseChildren = (childrenString) => {
        return childrenString.split(",").map(item => item.trim()).filter(item => item !== "");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.05
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    const modalVariants = {
        hidden: { opacity: 0, y: -50, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            y: -30,
            scale: 0.95,
            transition: { duration: 0.2 }
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    key="modal"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md m-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Category</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                            <input
                                type="text"
                                name="parent"
                                value={formData.parent || ''}
                                onChange={handleChange}
                                className={`w-full p-3 border ${formErrors.parent ? 'border-red-500' : 'border-gray-300'} dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200`}
                                placeholder="Enter category name"
                            />
                            {formErrors.parent && <p className="mt-1 text-sm text-red-500">{formErrors.parent}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 min-h-[100px]"
                                placeholder="Enter description"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Type</label>
                            <input
                                type="text"
                                name="productType"
                                value={formData.productType || ''}
                                onChange={handleChange}
                                className={`w-full p-3 border ${formErrors.productType ? 'border-red-500' : 'border-gray-300'} dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200`}
                                placeholder="Enter product type"
                            />
                            {formErrors.productType && <p className="mt-1 text-sm text-red-500">{formErrors.productType}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status || 'active'}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                            </select>
                        </motion.div>

                        <motion.div variants={itemVariants} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                            <input
                                type="text"
                                name="img"
                                value={formData.img || ''}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                placeholder="Enter image URL"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Children Categories (comma-separated)</label>
                            <input
                                type="text"
                                name="children"
                                value={formatChildren(formData.children)}
                                onChange={(e) => setFormData({ ...formData, children: parseChildren(e.target.value) })}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                placeholder="Enter child categories, comma-separated"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <span className="flex items-center">
                                    {isLoading && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </span>
                            </button>
                        </motion.div>

                        <AnimatePresence>
                            {isSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Category updated successfully!
                                </motion.div>
                            )}
                            {isError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Error updating category. Please try again.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CategoryEditModal;