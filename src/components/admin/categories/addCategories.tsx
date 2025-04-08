"use client";

import { useState, useEffect } from "react";
import { useAddCategoryMutation } from "../../../redux/features/categoryApi";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Upload, Tag, Check, AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";

// Import shadcn/ui components
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../../components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Progress } from "../../../components/ui/progress";
import { Switch } from "../../../components/ui/switch";
import { Separator } from "../../../components/ui/separator";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";

const AddCategoryForm = () => {
    const [addCategory, { isLoading, isError, isSuccess, error }] = useAddCategoryMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [childrenTags, setChildrenTags] = useState([]);
    const [childInputValue, setChildInputValue] = useState("");
    interface ValidationErrors {
        parent?: string;
        productType?: string;
        img?: string;
    }

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [formTouched, setFormTouched] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState({
        img: "",
        parent: "",
        children: [],
        productType: "",
        description: "",
        status: "Show",
        featured: false,
        metaTitle: "",
        metaDescription: "",
        displayOrder: 0,
        icon: "",
        bannerImage: "",
        taxonomyCode: "",
    });

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setFormData({
                    img: "",
                    parent: "",
                    children: [],
                    productType: "",
                    description: "",
                    status: "Show",
                    featured: false,
                    metaTitle: "",
                    metaDescription: "",
                    displayOrder: 0,
                    icon: "",
                    bannerImage: "",
                    taxonomyCode: "",
                });
                setImageFile(null);
                setImagePreview(null);
                setChildrenTags([]);
                setChildInputValue("");
                setValidationErrors({});
                setFormTouched(false);
                setActiveTab("basic");
                setUploadProgress(0);
            }, 300);
        }
    }, [isOpen]);

    // Simulated upload progress
    useEffect(() => {
        if (isUploading && uploadProgress < 100) {
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + Math.floor(Math.random() * 10);
                });
            }, 200);

            return () => clearInterval(interval);
        }
    }, [isUploading, uploadProgress]);

    // Success message timeout
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                setIsOpen(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Mark form as touched for validation
        setFormTouched(true);

        // Clear validation error for this field when changed
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAddChildTag = () => {
        if (childInputValue.trim() && !childrenTags.includes(childInputValue.trim())) {
            setChildrenTags([...childrenTags, childInputValue.trim()]);
            setChildInputValue("");

            // Also update the form data
            setFormData({
                ...formData,
                children: [...childrenTags, childInputValue.trim()]
            });
        }
    };

    const handleRemoveChildTag = (indexToRemove) => {
        const updatedTags = childrenTags.filter((_, index) => index !== indexToRemove);
        setChildrenTags(updatedTags);

        // Update form data
        setFormData({
            ...formData,
            children: updatedTags
        });
    };

    const handleChildInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddChildTag();
        }
    };

    const validateForm = () => {
        const errors: ValidationErrors = {};

        if (!formData.parent.trim()) {
            errors.parent = "Category name is required";
        }

        if (!formData.productType.trim()) {
            errors.productType = "Product type is required";
        }

        if (!imageFile && !formData.img) {
            errors.img = "Category image is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            setFormTouched(true);
            return;
        }

        // Handle image upload
        let imageUrl = formData.img;
        if (imageFile) {
            setIsUploading(true);
            try {
                imageUrl = await uploadToCloudinary(imageFile);
                setUploadProgress(100);
            } catch (error) {
                setValidationErrors(prev => ({
                    ...prev,
                    img: "Failed to upload image"
                }));
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        // Submit the category
        await addCategory({
            ...formData,
            img: imageUrl,
            children: childrenTags,
        });
    };

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    };

    const contentVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const tagVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
    };

    return (
        <div className="flex items-end justify-end">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-all hover:shadow-xl">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </DialogTrigger>

                <AnimatePresence>
                    {isOpen && (
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0">
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={contentVariants}
                                className="flex flex-col h-full"
                            >
                                <DialogHeader className="px-6 pt-6 pb-2">
                                    <div className="flex items-center">
                                        <Tag className="h-5 w-5 mr-2 text-blue-600" />
                                        <DialogTitle className="text-2xl font-semibold">Add New Category</DialogTitle>
                                    </div>
                                    <DialogDescription>
                                        Create a new product category for your store
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Success and Error Messages */}
                                <AnimatePresence>
                                    {isSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mx-6 mb-4"
                                        >
                                            <Alert variant="default" className="bg-green-50 border-green-200">
                                                <Check className="h-4 w-4 text-green-600" />
                                                <AlertTitle className="text-green-700">Success</AlertTitle>
                                                <AlertDescription className="text-green-600">
                                                    Category added successfully! Redirecting...
                                                </AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}

                                    {isError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mx-6 mb-4"
                                        >
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription>
                                                    {"data" in error && (error.data as { message?: string })?.message || "Failed to add category. Please try again."}
                                                </AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Tabs Navigation */}
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="basic" className="relative">
                                            Basic Info
                                            {formTouched && validationErrors.parent && (
                                                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="products" className="relative">
                                            Products
                                            {formTouched && validationErrors.productType && (
                                                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                                            )}
                                        </TabsTrigger>
                                    </TabsList>


                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
                                        <ScrollArea className="px-6 pb-6 h-[60vh]">

                                            <div className="py-4">
                                                {/* Basic Info Tab */}

                                                <TabsContent value="basic" className="space-y-4 py-2">
                                                    <FormItem>
                                                        <FormLabel >Category Image</FormLabel>
                                                        <Card className={`border-dashed ${validationErrors.img && formTouched ? "border-red-300 bg-red-50" : ""}`}>
                                                            <CardContent className="pt-6">
                                                                {!imagePreview ? (
                                                                    <div
                                                                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                                                        onClick={() => document.getElementById('imageUpload').click()}
                                                                    >
                                                                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                                                        <p className="text-sm font-medium text-gray-700">Click to upload</p>
                                                                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (Max. 2MB)</p>
                                                                        <Input
                                                                            id="imageUpload"
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={handleImageChange}
                                                                            className="hidden"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="relative">
                                                                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                                                            <Image
                                                                                src={imagePreview}
                                                                                alt="Preview"
                                                                                fill
                                                                                className="object-cover"
                                                                            />
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="absolute top-2 right-2 bg-white"
                                                                            onClick={() => {
                                                                                setImagePreview(null);
                                                                                setImageFile(null);
                                                                            }}
                                                                        >
                                                                            <X size={16} />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                        {validationErrors.img && formTouched && (
                                                            <FormMessage className="text-red-500">{validationErrors.img}</FormMessage>
                                                        )}
                                                    </FormItem>
                                                    <FormItem>
                                                        <FormLabel>
                                                            Category Name <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                name="parent"
                                                                value={formData.parent}
                                                                onChange={handleChange}
                                                                placeholder="e.g. Electronics"
                                                                className={validationErrors.parent && formTouched ? "border-red-500" : ""}
                                                            />
                                                        </FormControl>
                                                        {validationErrors.parent && formTouched && (
                                                            <FormMessage className="text-red-500">{validationErrors.parent}</FormMessage>
                                                        )}
                                                    </FormItem>

                                                    <FormItem>
                                                        <FormLabel>
                                                            Product Type <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                name="productType"
                                                                value={formData.productType}
                                                                onChange={handleChange}
                                                                placeholder="e.g. Physical, Digital"
                                                                className={validationErrors.productType && formTouched ? "border-red-500" : ""}
                                                            />
                                                        </FormControl>
                                                        {validationErrors.productType && formTouched && (
                                                            <FormMessage className="text-red-500">{validationErrors.productType}</FormMessage>
                                                        )}
                                                    </FormItem>

                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                name="description"
                                                                value={formData.description}
                                                                onChange={handleChange}
                                                                placeholder="Brief description of this category"
                                                                rows={3}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Describe what type of products are included in this category
                                                        </FormDescription>
                                                    </FormItem>

                                                    <FormItem>
                                                        <FormLabel>Subcategories</FormLabel>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            <AnimatePresence>
                                                                {childrenTags.map((tag, index) => (
                                                                    <motion.div
                                                                        key={tag + index}
                                                                        initial="hidden"
                                                                        animate="visible"
                                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                                        variants={tagVariants}
                                                                        layout
                                                                    >
                                                                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                                                                            {tag}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveChildTag(index)}
                                                                                className="ml-2 text-gray-400 hover:text-gray-700"
                                                                            >
                                                                                <X size={12} />
                                                                            </button>
                                                                        </Badge>
                                                                    </motion.div>
                                                                ))}
                                                            </AnimatePresence>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={childInputValue}
                                                                onChange={(e) => setChildInputValue(e.target.value)}
                                                                onKeyDown={handleChildInputKeyDown}
                                                                placeholder="Enter subcategory and press Enter"
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={handleAddChildTag}
                                                                disabled={!childInputValue.trim()}
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>
                                                        <FormDescription>
                                                            Add subcategories separated by Enter or comma
                                                        </FormDescription>
                                                    </FormItem>

                                                    <FormItem>
                                                        <FormLabel>Status</FormLabel>
                                                        <Select name="status" value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Show">
                                                                    <div className="flex items-center">
                                                                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                                                        Show
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="Hide">
                                                                    <div className="flex items-center">
                                                                        <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                                                                        Hide
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="Draft">
                                                                    <div className="flex items-center">
                                                                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                                                                        Draft
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>

                                                    <FormItem className="flex items-center justify-between gap-2 rounded-lg border p-4">
                                                        <div>
                                                            <FormLabel className="text-base">Featured Category</FormLabel>
                                                            <FormDescription>
                                                                Display this category prominently on the homepage
                                                            </FormDescription>
                                                        </div>
                                                        <Switch
                                                            checked={formData.featured}
                                                            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                                                        />
                                                    </FormItem>
                                                </TabsContent>
                                            </div>

                                        </ScrollArea>

                                        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isLoading || isUploading}
                                                className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                                            >
                                                {isLoading || isUploading ? (
                                                    <span className="flex items-center">
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        {isUploading ? `Uploading ${uploadProgress}%` : "Saving..."}
                                                    </span>
                                                ) : (
                                                    "Add Category"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Tabs>
                            </motion.div>
                        </DialogContent>
                    )}
                </AnimatePresence>
            </Dialog>
        </div>
    );
};

export default AddCategoryForm;