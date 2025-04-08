"use client";

import React, { useState, useRef, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { HiPencil, HiTrash } from "react-icons/hi";
import CategoryEditModal from "./CategoryEditModal";
import { useDeleteCategoryMutation } from "../../../redux/features/categoryApi";
import { useClickAway } from "react-use";

interface CategoryDropdownProps {
    category: {
        _id: string;
        name: string;
        parent: string;
        description: string;
        productType: string;
        status: string;
        img: string;
        children: string[];
    };
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const confirmModalRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useClickAway(dropdownRef, () => {
        if (isOpen) setIsOpen(false);
    });

    // Close confirmation modal when clicking outside
    useClickAway(confirmModalRef, () => {
        if (isConfirmingDelete && !isDeleting) setIsConfirmingDelete(false);
    });

    // Reset delete status after showing success/error message
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (deleteStatus === "success" || deleteStatus === "error") {
            timer = setTimeout(() => {
                setDeleteStatus("idle");
                if (deleteStatus === "success") {
                    setIsConfirmingDelete(false);
                }
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [deleteStatus]);

    const handleDelete = async () => {
        try {
            setDeleteStatus("loading");
            await deleteCategory(category._id).unwrap();
            setDeleteStatus("success");
        } catch (error) {
            console.error("Error deleting category:", error);
            setDeleteStatus("error");
        }
    };

    const closeAllModals = () => {
        setIsOpen(false);
        setIsEditing(false);
        setIsConfirmingDelete(false);
    };

    // Animation variants
    const dropdownVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -5 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: -5,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    const confirmModalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            transition: {
                duration: 0.15
            }
        }
    };

    const buttonVariants = {
        rest: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    const optionVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (custom: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: custom * 0.05,
                duration: 0.2,
                ease: "easeOut"
            }
        }),
        hover: {
            backgroundColor: "rgba(243, 244, 246, 1)",
            transition: { duration: 0.1 }
        },
        tap: { scale: 0.98 }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                whileHover={{ rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Category options"
            >
                <BsThreeDots className="text-lg text-gray-600" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute right-0 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 w-36 z-10 border border-gray-200 dark:border-gray-700 overflow-hidden"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.button
                            onClick={() => {
                                setIsEditing(true);
                                setIsOpen(false);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            variants={optionVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <HiPencil className="mr-2 text-blue-500" />
                            <span>Edit</span>
                        </motion.button>

                        <motion.button
                            onClick={() => {
                                setIsConfirmingDelete(true);
                                setIsOpen(false);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            variants={optionVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <HiTrash className="mr-2" />
                            <span>Delete</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isEditing && (
                    <CategoryEditModal
                        category={category}
                        onClose={() => setIsEditing(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isConfirmingDelete && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div
                            ref={confirmModalRef}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl"
                            variants={confirmModalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-6">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900">
                                    <HiTrash className="w-6 h-6 text-red-600 dark:text-red-300" />
                                </div>
                                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                                    Delete Category
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center">
                                    Are you sure you want to delete <span className="font-medium">{category.parent}</span>? This action cannot be undone.
                                </p>
                            </div>

                            {deleteStatus === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-md text-sm"
                                >
                                    Error deleting category. Please try again.
                                </motion.div>
                            )}

                            {deleteStatus === "success" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded-md text-sm"
                                >
                                    Category deleted successfully!
                                </motion.div>
                            )}

                            <div className="flex justify-end gap-3">
                                <motion.button
                                    onClick={() => setIsConfirmingDelete(false)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                                    variants={buttonVariants}
                                    initial="rest"
                                    whileHover="hover"
                                    whileTap="tap"
                                    disabled={deleteStatus === "loading"}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 disabled:opacity-50 transition-colors duration-200 flex items-center"
                                    variants={buttonVariants}
                                    initial="rest"
                                    whileHover="hover"
                                    whileTap="tap"
                                    disabled={deleteStatus === "loading" || deleteStatus === "success"}
                                >
                                    {deleteStatus === "loading" ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : deleteStatus === "success" ? (
                                        "Deleted"
                                    ) : (
                                        "Yes, Delete"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryDropdown;