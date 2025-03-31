"use client"; // Required for client-side fetching in Next.js

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetShowCategoryQuery } from "../../../redux/features/categoryApi";

const AllCategories = () => {
    const { data: categories, isLoading, isError } = useGetShowCategoryQuery("electronics");
    const router = useRouter();

    // Function to navigate to a specific category page
    const handleCategoryRoute = (title: string) => {
        const formattedTitle = title.toLowerCase().replace(/&/g, "").split(" ").join("-");
        router.push(`/shop?category=${formattedTitle}`);
    };
    console.log("Categories Data:", categories);
    console.log("Loading State:", isLoading);
    console.log("Error State:", isError);

    return (
        <section className="tp-product-category pt-2 pb-15">
            <div className="container">
                <h2 className="text-center mb-4 text-xl font-bold">All Categories</h2>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-5">
                        <p className="text-gray-500">Loading categories...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="text-center py-5">
                        <p className="text-red-500">There was an error loading categories.</p>
                    </div>
                )}

                {/* No Categories Found */}
                {!isLoading && !isError && categories?.result.length === 0 && (
                    <div className="text-center py-5">
                        <p className="text-gray-500">No categories found!</p>
                    </div>
                )}

                {/* Categories Grid */}
                {!isLoading && !isError && categories?.result.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-black">
                        {categories.result.map((category: any) => (
                            <div key={category._id} className="p-4 border rounded-lg shadow-md bg-white">
                                {/* Category Image */}
                                <div
                                    className="cursor-pointer"
                                    onClick={() => handleCategoryRoute(category.parent)}
                                >
                                    <Image
                                        src={category.img}
                                        alt={category.parent}
                                        width={100}
                                        height={100}
                                        className="mx-auto rounded-md"
                                    />
                                </div>

                                {/* Category Name */}
                                <h3
                                    className="mt-2 text-lg font-semibold text-center cursor-pointer hover:text-blue-500"
                                    onClick={() => handleCategoryRoute(category.parent)}
                                >
                                    {category.parent}
                                </h3>

                                {/* Additional Category Info */}
                                <p className="text-gray-500 text-sm text-center">Type: {category.productType}</p>
                                <p className="text-gray-500 text-sm text-center">{category.description}</p>
                                <p className="text-green-600 text-sm text-center font-semibold">{category.status}</p>

                                {/* Subcategories */}
                                {category.children?.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-gray-700 text-sm font-bold">Subcategories:</p>
                                        <ul className="list-disc list-inside text-gray-500 text-sm">
                                            {category.children.map((child: string, index: number) => (
                                                <li key={index}>{child}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Products in this Category */}
                                {category.products?.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-gray-700 text-sm font-bold">Products:</p>
                                        <ul className="space-y-2">
                                            {category.products.map((product: any) => (
                                                <li
                                                    key={product._id}
                                                    className="border p-2 rounded-md shadow-sm"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Image
                                                            src={product.img}
                                                            alt={product.title}
                                                            width={50}
                                                            height={50}
                                                            className="rounded-md"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-semibold">{product.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {product.brand?.name} - ${product.price}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllCategories;
