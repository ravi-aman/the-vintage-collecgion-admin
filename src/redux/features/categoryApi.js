import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    addCategory: builder.mutation({
      query: (data) => ({
        url: `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/add`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"], // Invalidate cache only on category addition
    }),

    getShowCategory: builder.query({
      query: () => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/show`,
    }),

    getProductTypeCategory: builder.query({
      query: (type) => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/show/${type}`,
    }),

    getAllCategories: builder.query({
      query: () => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/all`,
    }),

    getSingleCategory: builder.query({
      query: (id) => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/get/${id}`,
    }),

    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/edit/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Category"], // Invalidate cache only on category update
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"], // Invalidate cache only on category deletion
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useGetShowCategoryQuery,
  useGetProductTypeCategoryQuery,
  useGetAllCategoriesQuery,
  useGetSingleCategoryQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
