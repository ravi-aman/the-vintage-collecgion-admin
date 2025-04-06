import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Card, CardContent } from "../../../components/ui/card";
import { Switch } from "../../../components/ui/switch";
import { Badge } from "../../../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { format } from "date-fns";
import { Plus, Trash, Upload, X, Info, Tag, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { useGetActiveBrandsQuery } from "../../../redux/features/brandApi";
import { useGetAllCategoriesQuery } from "../../../redux/features/categoryApi";
import { useAddProductMutation } from "../../../redux/features/productApi";
import { uploadMultipleToCloudinary } from "utils/uploadToCloudinary";
import { uploadToCloudinary } from "utils/uploadToCloudinary";
import { toast } from "react-toastify";
import ColorVariantsManager from "./varients";


export default function AddProduct() {




    // Main product information
    const [title, setTitle] = useState("");
    const [sku, setSku] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("");
    const [productType, setProductType] = useState("");
    const [status, setStatus] = useState("in-stock");
    const [videoId, setVideoId] = useState("");
    const [featured, setFeatured] = useState(false);


    // Categories and brand
    const [parent, setParent] = useState("");
    const [children, setChildren] = useState("");
    const [brandName, setBrandName] = useState("");
    const [brandId, setBrandId] = useState("");


    // Sizes and tags
    const [sizes, setSizes] = useState([]);
    const [newSize, setNewSize] = useState("");
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");

    // Images
    const [mainImage, setMainImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);

    // Color variants with images
    const [colorVariants, setColorVariants] = useState([]);
    const [newColorName, setNewColorName] = useState("");
    const [newColorCode, setNewColorCode] = useState("#000000");
    const [newColorImage, setNewColorImage] = useState(null);
    const [newColorSizes, setNewColorSizes] = useState([]);

    // Offer dates
    const [offerStartDate, setOfferStartDate] = useState(null);
    const [offerEndDate, setOfferEndDate] = useState(null);

    // Additional information
    const [additionalInfo, setAdditionalInfo] = useState([]);

    // Validation and submission
    type ValidationErrors = {
        title?: string;
        price?: string;
        parent?: string;
        children?: string;
        [key: string]: string | undefined; // Allow additional keys dynamically
    };

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Generate slug from title
    useEffect(() => {
        setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
    }, [title]);



    const [mainImageUrl, setMainImageUrl] = useState("");

    // Handle main image upload
    const handleMainImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
        }
        const uploadedUrl = await uploadToCloudinary(file);
        if (uploadedUrl) {
            setMainImageUrl(uploadedUrl);
            console.log("Uploaded URL:", uploadedUrl);
        }
    };

    // Handle additional images upload
    const handleAdditionalImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        setAdditionalImages([...additionalImages, ...files]);
    };

    // Remove additional image
    const removeAdditionalImage = (index) => {
        setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    };



    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];


    // Add size
    const addSize = () => {
        if (newSize && !sizes.includes(newSize)) {
            setSizes([...sizes, newSize]);
            setNewSize("");
        }
    };

    // Remove size
    const removeSize = (size) => {
        setSizes(sizes.filter(s => s !== size));
    };

    // Add tag
    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag("");
        }
    };

    // Remove tag
    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    // Add color variant
    const addColorVariant = () => {
        if (newColorName && newColorCode && newColorImage) {
            setColorVariants([
                ...colorVariants,
                {
                    color: {
                        name: newColorName,
                        clrCode: newColorCode
                    },
                    img: URL.createObjectURL(newColorImage),
                    imgFile: newColorImage,
                    sizes: newColorSizes
                }
            ]);
            setNewColorName("");
            setNewColorCode("#000000");
            setNewColorImage(null);
            setNewColorSizes([]);
        }
    };

    // Remove color variant
    const removeColorVariant = (index) => {
        setColorVariants(colorVariants.filter((_, i) => i !== index));
    };

    // Add additional info field
    const addAdditionalInfoField = () => {
        setAdditionalInfo([...additionalInfo, { key: "", value: "" }]);
    };

    // Update additional info
    const updateAdditionalInfo = (index, field, value) => {
        const updatedInfo = [...additionalInfo];
        updatedInfo[index][field] = value;
        setAdditionalInfo(updatedInfo);
    };


    // Remove additional info field
    const removeAdditionalInfoField = (index: number) => {
        setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
    };

    // get the brand for option
    //categories.....................

    const [selectedCategory, setSelectedCategory] = useState({ id: "", name: "" });
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [selectedChildrenOptions, setSelectedChildrenOptions] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState("");

    // get categories 
    const { data: categorydata, isLoading: categoriesLoading, isError: categoriesError } = useGetAllCategoriesQuery({});
    const categories = categorydata?.result || []; // Ensure `categories` is an array


    // get the brand for option
    // brands........................ 

    const [selectedBrand, setSelectedBrand] = useState({ id: "", name: "" });
    // get brands
    const { data, isLoading: brandsLoading, isError: brandsError } = useGetActiveBrandsQuery({});
    const brands = data?.result || []; // Ensure `brands` is an array
    // State to store selected brand ID and name
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedBrandName, setSelectedBrandName] = useState("");



    //upload to cloudinary








    // Handle form submission.............

    const [addProduct, { isLoading: productLoading, isError: productError }] = useAddProductMutation();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        console.log("Form submitted with values:")
     



        // Validate form
        type ValidationErrors = {
            title?: string;
            price?: string;
            unit?: string;
            mainImage?: string;
            parent?: string;
            children?: string;
            brandName?: string;
            description?: string;
            productType?: string;
        };

        // const validationErrors: ValidationErrors = {};
        // if (!title) validationErrors.title = "Title is required";
        // if (!price) validationErrors.price = "Price is required";
        // if (!unit) validationErrors.unit = "Unit is required";
        // if (!mainImage) validationErrors.mainImage = "Main image is required";
        // if (!parent) validationErrors.parent = "Parent category is required";
        // if (!children) validationErrors.children = "Sub-category is required";
        // if (!brandName) validationErrors.brandName = "Brand is required";
        // if (!description) validationErrors.description = "Description is required";
        // if (!productType) validationErrors.productType = "Product type is required";

        // if (Object.keys(validationErrors).length > 0) {
        //     toast.error("Please fill all required fields.");
        //     setErrors(validationErrors);
        //     setIsSubmitting(false);
        //     return;
        // }


        console.log("validated")
        // Prepare form data
        const formData = {
            title,
            sku,
            slug,
            description,
            price: parseFloat(price),
            discount: discount ? parseFloat(discount) : undefined,
            quantity: parseInt(quantity),
            unit,
            productType: productType.toLowerCase(),
            status,
            videoId,
            featured,
            parent: selectedBrandName,
            children: children,
            brand: {
                name: selectedBrandName,
                id: selectedBrandId
            },
            category: {
                name: selectedCategoryName,
                id: selectedCategoryId
            },
            sizes,
            tags,
            img: mainImageUrl,
            imageURLs: colorVariants.map(variant => ({
                color: {
                    name: variant.color.name,
                    clrCode: variant.color.clrCode
                },
                img: variant.img,
                sizes: variant.sizes.map(size => size)
            })),

            offerDate: {
                startDate: new Date('2025-04-01T18:30:00.000Z').toISOString().replace('Z', '+00:00'),
                endDate: new Date('2025-04-23T18:30:00.000Z').toISOString().replace('Z', '+00:00')
            },
            additionalInformation: additionalInfo
        };

        console.log("Form Data:", formData); // Log the form data for debugging


        try {
            const result = await addProduct(formData).unwrap();
            console.log("✅ Product Added Successfully:", result);

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
            }, 2000);
        } catch (error) {
            console.error("❌ Error adding product:", error);
            setErrors({ submit: "Failed to add product. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Add New Product</DialogTitle>
                </DialogHeader>

                <form
                // onSubmit={handleSubmit}
                >
                    <Tabs defaultValue="basic" className="mt-6">
                        <TabsList className="grid grid-cols-5 mb-6">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="images">Images</TabsTrigger>
                            <TabsTrigger value="variants">Variants</TabsTrigger>
                            <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            <TabsTrigger value="additional">Additional</TabsTrigger>
                        </TabsList>

                        {/* Basic Info Tab */}
                        <TabsContent value="basic">
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className={errors.title ? "border-red-500" : ""}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className={errors.price ? "border-red-500" : ""}
                                        />
                                        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discount">Discount (Optional)</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Parent Category */}
                                    <div className="space-y-2">
                                        <Label htmlFor="parent">Parent Category <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={selectedCategoryId}
                                            onValueChange={(value) => {
                                                const selected = categories.find(cat => String(cat._id) === value);
                                                if (selected) {
                                                    setSelectedCategoryId(selected._id);
                                                    setSelectedCategoryName(selected.parent); // as per schema
                                                    setChildren(""); // reset sub-category when parent changes
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoriesLoading ? (
                                                    <SelectItem disabled value="">Loading...</SelectItem>
                                                ) : categoriesError ? (
                                                    <SelectItem disabled value="">Error loading categories</SelectItem>
                                                ) : (
                                                    categories.map((cat) => (
                                                        <SelectItem key={cat._id} value={String(cat._id)}>
                                                            {cat.parent}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.parent && <p className="text-red-500 text-sm">{errors.parent}</p>}
                                    </div>

                                    {/* Sub-Category */}
                                    <div className="space-y-2">
                                        <Label htmlFor="children">Sub-Category <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={children}
                                            onValueChange={setChildren}
                                            disabled={!selectedCategoryId}
                                        >
                                            <SelectTrigger className={errors.children ? "border-red-500" : ""}>
                                                <SelectValue placeholder={!selectedCategoryId ? "Select parent first" : "Select sub-category"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedCategoryId && (
                                                    categories.find(cat => cat._id === selectedCategoryId)?.children?.map((child, index) => (
                                                        <SelectItem key={index} value={child}>
                                                            {child}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.children && <p className="text-red-500 text-sm">{errors.children}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Brand <span className="text-red-500">*</span></Label>

                                        <Select
                                            value={selectedBrandId} // Ensure controlled component behavior
                                            onValueChange={(value) => {
                                                console.log("Selected Value:", value); // Debugging log

                                                // Find the selected brand
                                                const selected = brands.find(brand => String(brand._id) === String(value)) || { id: "", name: "" };
                                                // Update state
                                                setSelectedBrandId(selected._id);
                                                setSelectedBrandName(selected.name);

                                                // // Console log the selected values
                                                // console.log("Selected Brand ID:", selected._id);
                                                // console.log("Selected Brand Name:", selected.name);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue>
                                                    {selectedBrandName || (brandsLoading ? "Loading..." : "Select brand")}
                                                </SelectValue>
                                            </SelectTrigger>

                                            <SelectContent>
                                                {brandsLoading ? (
                                                    <SelectItem disabled value="">Loading...</SelectItem>
                                                ) : brandsError ? (
                                                    <SelectItem disabled value="">Error loading brands</SelectItem>
                                                ) : (
                                                    brands.map((brand) => (
                                                        <SelectItem key={brand._id} value={String(brand._id)}>
                                                            {brand.name} {/* Show only the brand name in options */}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>


                                        {/* Display selected brand for testing
                                        {selectedBrandId && (
                                            <p className="text-sm text-gray-700">Selected: {selectedBrandName} and  (ID: {selectedBrandId})</p>
                                        )} */}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="productType">Product Type <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="productType"
                                            value={productType}
                                            onChange={(e) => setProductType(e.target.value)}
                                            className={errors.productType ? "border-red-500" : ""}
                                        />
                                        {errors.productType && <p className="text-red-500 text-sm">{errors.productType}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={`min-h-32 ${errors.description ? "border-red-500" : ""}`}
                                    />
                                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="videoId">Video ID (YouTube/Vimeo)</Label>
                                    <Input
                                        id="videoId"
                                        value={videoId}
                                        onChange={(e) => setVideoId(e.target.value)}
                                        placeholder="e.g. dQw4w9WgXcQ"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="featured"
                                        checked={featured}
                                        onCheckedChange={setFeatured}
                                    />
                                    <Label htmlFor="featured">Featured Product</Label>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Images Tab */}
                        <TabsContent value="images">
                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <Label htmlFor="mainImage">Main Product Image <span className="text-red-500">*</span></Label>
                                            {mainImage ? (
                                                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                                                    <Image
                                                        src={URL.createObjectURL(mainImage)}
                                                        alt="Main product"
                                                        className="w-full h-full object-contain"
                                                        width={200}
                                                        height={200}
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => setMainImage(null)}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 ${errors.mainImage ? "border-red-500" : "border-gray-300"}`}
                                                    onClick={() => document.getElementById('mainImage').click()}
                                                >
                                                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                                    <Input
                                                        id="mainImage"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleMainImageUpload}
                                                    />
                                                </div>
                                            )}
                                            {errors.mainImage && <p className="text-red-500 text-sm">{errors.mainImage}</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <Label>Additional Product Images</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {additionalImages.map((img, index) => (
                                                    <div key={index} className="relative">
                                                        <Image
                                                            src={URL.createObjectURL(img)}
                                                            alt={`Additional ${index + 1}`}
                                                            className="w-full h-32 object-contain border rounded-lg"
                                                            width={200}
                                                            height={200}
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            className="absolute top-1 right-1 h-6 w-6"
                                                            onClick={() => removeAdditionalImage(index)}
                                                        >
                                                            <X size={14} />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div
                                                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center h-32"
                                                    onClick={() => document.getElementById('additionalImages').click()}
                                                >
                                                    <Plus className="h-8 w-8 text-gray-400" />
                                                    <p className="mt-1 text-xs text-gray-500">Add Image</p>
                                                    <Input
                                                        id="additionalImages"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleAdditionalImagesUpload}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card> */}
                            </div>
                        </TabsContent>

                        <TabsContent value="variants">
                            <ColorVariantsManager
                                colorVariants={colorVariants}
                                setColorVariants={setColorVariants}
                                sizes={availableSizes}
                            />
                        </TabsContent>

                        {/* Inventory Tab */}
                        <TabsContent value="inventory">
                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    min="0"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="unit">Unit <span className="text-red-500">*</span></Label>
                                                <Select onValueChange={setUnit} value={unit}>
                                                    <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="piece">Piece</SelectItem>
                                                        <SelectItem value="kg">Kilogram</SelectItem>
                                                        <SelectItem value="g">Gram</SelectItem>
                                                        <SelectItem value="l">Liter</SelectItem>
                                                        <SelectItem value="ml">Milliliter</SelectItem>
                                                        <SelectItem value="dozen">Dozen</SelectItem>
                                                        <SelectItem value="pair">Pair</SelectItem>
                                                        <SelectItem value="set">Set</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.unit && <p className="text-red-500 text-sm">{errors.unit}</p>}
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select onValueChange={setStatus} value={status}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="in-stock">In Stock</SelectItem>
                                                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                                                    <SelectItem value="discontinued">Discontinued</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <Label>Offer Date Range</Label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="startDate">Start Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start text-left font-normal"
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {offerStartDate ? format(offerStartDate, "PPP") : "Select date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={offerStartDate}
                                                            onSelect={setOfferStartDate}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="endDate">End Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start text-left font-normal"
                                                            disabled={!offerStartDate}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {offerEndDate ? format(offerEndDate, "PPP") : "Select date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={offerEndDate}
                                                            onSelect={setOfferEndDate}
                                                            disabled={(date) =>
                                                                offerStartDate ? date < offerStartDate : false
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Additional Tab */}
                        <TabsContent value="additional">
                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <Label>Tags</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tags.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="px-3 py-1 flex items-center gap-1">
                                                    {tag}
                                                    <X
                                                        size={14}
                                                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                                                        onClick={() => removeTag(tag)}
                                                    />
                                                </Badge>
                                            ))}
                                            <div className="flex items-center">
                                                <Input
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    placeholder="Add tag"
                                                    className="w-32 h-8"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addTag();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addTag}
                                                    className="ml-2 h-8"
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Label>Additional Information</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addAdditionalInfoField}>
                                                <Plus size={16} className="mr-1" /> Add Field
                                            </Button>
                                        </div>
                                        {additionalInfo.length > 0 ? (
                                            <div className="space-y-3">
                                                {additionalInfo.map((item, index) => (
                                                    <div key={index} className="flex gap-3 items-center">
                                                        <Input
                                                            placeholder="Key (e.g. Weight, Material)"
                                                            value={item.key}
                                                            onChange={(e) => updateAdditionalInfo(index, "key", e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            placeholder="Value (e.g. 500g, Cotton)"
                                                            value={item.value}
                                                            onChange={(e) => updateAdditionalInfo(index, "value", e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeAdditionalInfoField(index)}
                                                        >
                                                            <Trash size={16} />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500">
                                                <Info className="h-10 w-10 mx-auto mb-2" />
                                                <p>Add specifications, features, or any other details</p>
                                                <p className="text-sm">Examples: Material, Weight, Dimensions, etc.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <div className="flex flex-col gap-4 w-full">
                            {/* Buttons */}
                            <div className="flex items-center gap-4 w-full">
                                <Button type="button" variant="outline" className="flex-1">
                                    Save as Draft
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    disabled={isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : isSuccess ? (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Product Added!
                                        </>
                                    ) : (
                                        'Publish Product'
                                    )}
                                </Button>
                            </div>

                            {/* Error Alert */}
                            {errors.submit && (
                                <div
                                    className="w-full px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded relative"
                                    role="alert"
                                >
                                    <strong className="font-bold">Oops! </strong>
                                    <span className="block sm:inline">{errors.submit}</span>
                                    <span
                                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                                        onClick={() => setErrors((prev) => ({ ...prev, submit: "" }))}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <svg
                                            className="fill-current h-6 w-6 text-red-500"
                                            role="button"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                        >
                                            <title>Close</title>
                                            <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z" />
                                        </svg>
                                    </span>
                                </div>
                            )}
                        </div>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog >
    );
}