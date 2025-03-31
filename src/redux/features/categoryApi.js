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
    }),
    getShowCategory: builder.query({
      query: () => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/show`
    }),
    getProductTypeCategory: builder.query({
      query: (type) => `${process.env.NEXT_PUBLIC_API_BASE_BACKEND_URL}/api/category/show/${type}`
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useGetProductTypeCategoryQuery,
  useGetShowCategoryQuery,
} = categoryApi;
