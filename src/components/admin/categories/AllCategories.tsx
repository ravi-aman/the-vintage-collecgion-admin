"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetAllCategoriesQuery, useGetShowCategoryQuery } from "../../../redux/features/categoryApi";
import CategoryDropdown from "./CategoryDropdown";

// Import shadcn/ui components
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../../components/ui/sheet";
import { motion } from "framer-motion";
import { Search, Filter, Grid3X3, List, RefreshCw, Download, Upload, Plus, Trash2, Edit, Eye, BarChart, AlertTriangle, Tag } from "lucide-react";
import { Progress } from "../../../components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { FormProvider, useForm } from "react-hook-form";
import AddCategoryForm from "./addCategories";

const AllCategories = () => {
    const { data: categories, isLoading, isError, refetch } = useGetAllCategoriesQuery("electronics");
    const router = useRouter();

    // State management for enhanced functionality
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [sortBy, setSortBy] = useState("alphabetical");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showSubcategories, setShowSubcategories] = useState(true);
    const [showProducts, setShowProducts] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [showStats, setShowStats] = useState(true);
    const [expanded, setExpanded] = useState({});

    // Function to navigate to a specific category page
    const handleCategoryRoute = (title) => {
        const formattedTitle = title.toLowerCase().replace(/&/g, "").split(" ").join("-");
        router.push(`/shop?category=${formattedTitle}`);
    };

    // Function to handle category selection
    const handleSelectCategory = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    // Function to select all categories
    const handleSelectAll = () => {
        if (filteredCategories.length === selectedCategories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(filteredCategories.map(cat => cat._id));
        }
    };

    // Function to refresh data
    const handleRefresh = () => {
        setIsRefreshing(true);
        refetch().then(() => {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 800);
        });
    };

    // Handle category expansion
    const toggleExpand = (categoryId) => {
        setExpanded({
            ...expanded,
            [categoryId]: !expanded[categoryId]
        });
    };

    // Filter and Sort Functions
    const getFilteredCategories = () => {
        if (!categories?.result) return [];

        let result = [...categories.result];

        // Apply search filter
        if (searchTerm) {
            result = result.filter(cat =>
                cat.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.productType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.children?.some(child => child.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply status filter
        if (filterStatus !== "all") {
            result = result.filter(cat => cat.status?.toLowerCase() === filterStatus.toLowerCase());
        }

        // Apply sort
        switch (sortBy) {
            case "alphabetical":
                result.sort((a, b) => a.parent.localeCompare(b.parent));
                break;
            case "productCount":
                result.sort((a, b) => (b.products?.length || 0) - (a.products?.length || 0));
                break;
            case "subcategoriesCount":
                result.sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0));
                break;
            case "dateCreated":
                // Assuming we have createdAt field, otherwise this will be a no-op
                result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
            default:
                break;
        }

        return result;
    };

    const filteredCategories = getFilteredCategories();

    // Calculate stats
    const statsData = categories?.result ? {
        totalCategories: categories.result.length,
        activeCategories: categories.result.filter(cat => cat.status === "show").length,
        totalProducts: categories.result.reduce((acc, cat) => acc + (cat.products?.length || 0), 0),
        totalSubcategories: categories.result.reduce((acc, cat) => acc + (cat.children?.length || 0), 0),
    } : {
        totalCategories: 0,
        activeCategories: 0,
        totalProducts: 0,
        totalSubcategories: 0
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const childVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };
    const methods = useForm();

    return (
        <section className="bg-white min-h-screen">
            <div className="container mx-auto p-6">
                <div className="flex flex-col gap-6">
                    {/* Header and Controls */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
                                <p className="text-gray-500">Manage and organize your product categories</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={handleRefresh}
                                                variant="outline"
                                                size="icon"
                                                className={isRefreshing ? "animate-spin" : ""}
                                            >
                                                <RefreshCw size={18} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Refresh categories</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <FormProvider {...methods}>
                                    < AddCategoryForm/>
                                </FormProvider>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        {showStats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-500">Total Categories</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statsData.totalCategories}</div>
                                        <Progress value={(statsData.totalCategories / 100) * 100} className="mt-2" />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-500">Active Categories</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{statsData.activeCategories}</div>
                                        <Progress
                                            value={(statsData.activeCategories / statsData.totalCategories) * 100}
                                            className="mt-2"
                                        />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-600">{statsData.totalProducts}</div>
                                        <Progress value={65} className="mt-2" />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-500">Total Subcategories</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-purple-600">{statsData.totalSubcategories}</div>
                                        <Progress value={42} className="mt-2" />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                                        <SelectItem value="productCount">Product Count</SelectItem>
                                        <SelectItem value="subcategoriesCount">Subcategories Count</SelectItem>
                                        <SelectItem value="dateCreated">Date Created</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="show">active</SelectItem>
                                        <SelectItem value="inactive">inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Filter size={18} />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>Advanced Filters</SheetTitle>
                                            <SheetDescription>
                                                Filter categories by various criteria
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="flex items-center justify-between">
                                                <label>Show Subcategories</label>
                                                <Switch
                                                    checked={showSubcategories}
                                                    onCheckedChange={setShowSubcategories}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label>Show Products</label>
                                                <Switch
                                                    checked={showProducts}
                                                    onCheckedChange={setShowProducts}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label>Show Analytics</label>
                                                <Switch
                                                    checked={showStats}
                                                    onCheckedChange={setShowStats}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Product Types</label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="physical" />
                                                    <label htmlFor="physical">Physical</label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="digital" />
                                                    <label htmlFor="digital">Digital</label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="service" />
                                                    <label htmlFor="service">Service</label>
                                                </div>
                                            </div>
                                            <div className="pt-4">
                                                <Button className="w-full">Apply Filters</Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                                <div className="flex border rounded-md overflow-hidden">
                                    <Button
                                        variant={viewMode === "grid" ? "default" : "ghost"}
                                        size="icon"
                                        onClick={() => setViewMode("grid")}
                                        className="rounded-none"
                                    >
                                        <Grid3X3 size={18} />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "default" : "ghost"}
                                        size="icon"
                                        onClick={() => setViewMode("list")}
                                        className="rounded-none"
                                    >
                                        <List size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Batch Actions */}
                        {selectedCategories.length > 0 && (
                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md mb-6">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <span className="text-sm font-medium">{selectedCategories.length} categories selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Tag className="mr-2 h-4 w-4" /> Set Status
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" /> Export
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center flex-col gap-4 py-12">
                                <div className="animate-spin">
                                    <RefreshCw size={32} className="text-blue-500" />
                                </div>
                                <p className="text-gray-500">Loading categories...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                There was an error loading categories. Please try refreshing the page.
                            </AlertDescription>
                            <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
                                <RefreshCw className="mr-2 h-4 w-4" /> Retry
                            </Button>
                        </Alert>
                    )}

                    {/* No Categories Found */}
                    {!isLoading && !isError && filteredCategories.length === 0 && (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="rounded-full bg-gray-100 p-4">
                                    <Tag size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">No Categories Found</h3>
                                <p className="text-gray-500 max-w-md">
                                    {searchTerm ?
                                        `No categories match your search for "${searchTerm}". Try adjusting your filters or search term.` :
                                        "You haven't created any categories yet. Create your first category to organize your products."}
                                </p>
                                <Button className="mt-2">
                                    <Plus className="mr-2 h-4 w-4" /> Create New Category
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Categories Display - Grid View */}
                    {!isLoading && !isError && filteredCategories.length > 0 && viewMode === "grid" && (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredCategories.map((category) => (
                                <motion.div
                                    key={category._id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden"
                                    variants={childVariants}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 z-10">
                                            <Checkbox
                                                checked={selectedCategories.includes(category._id)}
                                                onCheckedChange={() => handleSelectCategory(category._id)}
                                                className="bg-white border-gray-300"
                                            />
                                        </div>
                                        <div className="absolute top-3 right-3 z-10 flex gap-1">
                                            <Badge
                                                variant={category.status === "Active" ? "default" : "secondary"}
                                                className={category.status === "Active" ? "bg-green-500" : "bg-gray-500"}
                                            >
                                                {category.status}
                                            </Badge>
                                        </div>
                                        <div className="h-40 bg-gray-100 flex items-center justify-center p-4 relative">
                                            <Image
                                                src={category.img}
                                                alt={category.parent}
                                                width={120}
                                                height={120}
                                                className="object-contain max-h-32 transition-transform hover:scale-110 duration-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3
                                                className="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors"
                                                onClick={() => handleCategoryRoute(category.parent)}
                                            >
                                                {category.parent}
                                            </h3>
                                            <CategoryDropdown category={category} />
                                        </div>
                                        <p className="text-gray-500 text-sm mb-3">{category.description}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                            <span>Type: {category.productType}</span>
                                            <span className="flex items-center gap-1">
                                                <Tag size={14} /> {category.children?.length || 0} subcategories
                                            </span>
                                        </div>

                                        {/* Subcategories */}
                                        {showSubcategories && category.children?.length > 0 && (
                                            <div className="mt-3 border-t pt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-medium text-gray-700">Subcategories</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleExpand(category._id)}
                                                        className="h-6 text-xs"
                                                    >
                                                        {expanded[category._id] ? "Hide" : "Show all"}
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {(expanded[category._id] ? category.children : category.children.slice(0, 3)).map((child, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                                                            {child}
                                                        </Badge>
                                                    ))}
                                                    {!expanded[category._id] && category.children.length > 3 && (
                                                        <Badge variant="outline" className="text-xs bg-gray-50">
                                                            +{category.children.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Products Preview */}
                                        {showProducts && category.products?.length > 0 && (
                                            <div className="mt-3 border-t pt-3">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Products</h4>
                                                <div className="space-y-2">
                                                    {category.products.slice(0, 5).map((product) => (
                                                        <div
                                                            key={product._id}
                                                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                                                        >
                                                            <Image
                                                                src={product.img}
                                                                alt={product.title}
                                                                width={32}
                                                                height={32}
                                                                className="rounded-md object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">{product.title}</p>
                                                                <p className="text-xs text-gray-500">${product.price}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {category.products.length > 5 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs w-full h-8"
                                                        >
                                                            View all {category.products.length} products
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-3 border-t flex justify-between items-center">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit size={14} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye size={14} />
                                            </Button>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <BarChart size={14} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Categories Display - List View */}
                    {!isLoading && !isError && filteredCategories.length > 0 && viewMode === "list" && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="p-3 text-left">
                                                <Checkbox
                                                    checked={selectedCategories.length === filteredCategories.length}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="p-3 text-left text-sm font-medium text-gray-500">Category</th>
                                            <th className="p-3 text-left text-sm font-medium text-gray-500">Type</th>
                                            <th className="p-3 text-left text-sm font-medium text-gray-500">Subcategories</th>
                                            <th className="p-3 text-left text-sm font-medium text-gray-500">Products</th>
                                            <th className="p-3 text-left text-sm font-medium text-gray-500">Status</th>
                                            <th className="p-3 text-right text-sm font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCategories.map((category, index) => (
                                            <motion.tr
                                                key={category._id}
                                                className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ backgroundColor: "#f9fafb" }}
                                            >
                                                <td className="p-3">
                                                    <Checkbox
                                                        checked={selectedCategories.includes(category._id)}
                                                        onCheckedChange={() => handleSelectCategory(category._id)}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={category.img}
                                                                alt={category.parent}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4
                                                                className="font-medium text-gray-800 hover:text-blue-600 cursor-pointer"
                                                                onClick={() => handleCategoryRoute(category.parent)}
                                                            >
                                                                {category.parent}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 truncate max-w-md">{category.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">{category.productType}</td>
                                                <td className="p-3">
                                                    {category.children?.length > 0 ? (
                                                        <div>
                                                            <span className="text-sm text-gray-600">{category.children.length}</span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {category.children.slice(0, 2).map((child, idx) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                        {child}
                                                                    </Badge>
                                                                ))}
                                                                {category.children.length > 2 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{category.children.length - 2}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <span className="text-sm text-gray-600">{category.products?.length || 0}</span>
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={category.status === "Active" ? "default" : "secondary"}
                                                        className={category.status === "Active" ? "bg-green-500" : "bg-gray-500"}
                                                    >
                                                        {category.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Edit size={14} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Eye size={14} />
                                                        </Button>
                                                        <CategoryDropdown category={category} />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && !isError && filteredCategories.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium">{filteredCategories.length}</span> of{" "}
                                <span className="font-medium">{categories?.result.length}</span> categories
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" className="bg-blue-50">
                                    1
                                </Button>
                                <Button variant="outline" size="sm">
                                    2
                                </Button>
                                <Button variant="outline" size="sm">
                                    3
                                </Button>
                                <Button variant="outline" size="sm">
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AllCategories;