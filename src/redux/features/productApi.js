import { apiSlice } from "../api/apiSlice";

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/all`,
      providesTags: ['Products']
    }),
    getProductType: builder.query({
      query: ({ type, query }) => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/${type}?${query}`,
      providesTags: ['ProductType']
    }),
    getOfferProducts: builder.query({
      query: (type) => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/offer?type=${type}`,
      providesTags: ['OfferProducts']
    }),
    getPopularProductByType: builder.query({
      query: (type) => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/popular/${type}`,
      providesTags: ['PopularProducts']
    }),
    getTopRatedProducts: builder.query({
      query: () => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/top-rated`,
      providesTags: ['TopRatedProducts']
    }),
    // Get a single product
    getProduct: builder.query({
      query: (id) => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/single-product/${id}`,
      providesTags: (result, error, arg) => [{ type: "Product", id: arg }],
      invalidatesTags: (result, error, arg) => [
        { type: "RelatedProducts", id: arg },
      ],
    }),
    // Get related products
    getRelatedProducts: builder.query({
      query: (id) => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/related-product/${id}`,
      providesTags: (result, error, arg) => [
        { type: "RelatedProducts", id: arg },
      ],
    }),
    // Add a product
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/add`,
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: ['Products'],
    }),
    // Add all products
    addAllProducts: builder.mutation({
      query: (newProducts) => ({
        url: `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/add-all`,
        method: 'POST',
        body: newProducts,
      }),
      invalidatesTags: ['Products'],
    }),
    // Update a product
    updateProduct: builder.mutation({
      query: ({ id, updatedProduct }) => ({
        url: `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/edit-product/${id}`,
        method: 'PATCH',
        body: updatedProduct,
      }),
      invalidatesTags: ['Products'],
    }),
    // Delete a product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/product/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductTypeQuery,
  useGetOfferProductsQuery,
  useGetPopularProductByTypeQuery,
  useGetTopRatedProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useAddProductMutation,
  useAddAllProductsMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
