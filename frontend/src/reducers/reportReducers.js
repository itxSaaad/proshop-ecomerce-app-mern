import {
  SALES_ANALYTICS_REQUEST,
  SALES_ANALYTICS_SUCCESS,
  SALES_ANALYTICS_FAIL,
  SALES_ANALYTICS_RESET,
  PRODUCT_ANALYTICS_REQUEST,
  PRODUCT_ANALYTICS_SUCCESS,
  PRODUCT_ANALYTICS_FAIL,
  PRODUCT_ANALYTICS_RESET,
  CUSTOMER_ANALYTICS_REQUEST,
  CUSTOMER_ANALYTICS_SUCCESS,
  CUSTOMER_ANALYTICS_FAIL,
  CUSTOMER_ANALYTICS_RESET,
  ORDER_ANALYTICS_REQUEST,
  ORDER_ANALYTICS_SUCCESS,
  ORDER_ANALYTICS_FAIL,
  ORDER_ANALYTICS_RESET,
  FINANCIAL_SUMMARY_REQUEST,
  FINANCIAL_SUMMARY_SUCCESS,
  FINANCIAL_SUMMARY_FAIL,
  FINANCIAL_SUMMARY_RESET,
} from '../constants/reportConstants.js';

// Sales Analytics Reducer
export const salesAnalyticsReducer = (
  state = {
    loading: false,
    data: null,
    error: null,
  },
  action
) => {
  switch (action.type) {
    case SALES_ANALYTICS_REQUEST:
      return { loading: true, data: null, error: null };
    case SALES_ANALYTICS_SUCCESS:
      return {
        loading: false,
        data: {
          summary: action.payload.summary,
          paymentMethods: action.payload.paymentMethods,
          dailySales: action.payload.dailySales,
          monthlyComparison: action.payload.monthlyComparison,
          dateRange: action.payload.dateRange,
        },
        error: null,
      };
    case SALES_ANALYTICS_FAIL:
      return { loading: false, data: null, error: action.payload };
    case SALES_ANALYTICS_RESET:
      return { loading: false, data: null, error: null };
    default:
      return state;
  }
};

// Product Analytics Reducer
export const productAnalyticsReducer = (
  state = {
    loading: false,
    data: null,
    error: null,
  },
  action
) => {
  switch (action.type) {
    case PRODUCT_ANALYTICS_REQUEST:
      return { loading: true, data: null, error: null };
    case PRODUCT_ANALYTICS_SUCCESS:
      return {
        loading: false,
        data: {
          productPerformance: action.payload.productPerformance || [],
          categoryAnalysis: action.payload.categoryAnalysis || [],
          inventoryAnalysis: action.payload.inventoryAnalysis || [],
          stockSummary: action.payload.stockSummary || {},
          topPerformers: action.payload.topPerformers || [],
          worstPerformers: action.payload.worstPerformers || [],
          metrics: action.payload.metrics || {},
          dateRange: action.payload.dateRange,
        },
        error: null,
      };
    case PRODUCT_ANALYTICS_FAIL:
      return { loading: false, data: null, error: action.payload };
    case PRODUCT_ANALYTICS_RESET:
      return { loading: false, data: null, error: null };
    default:
      return state;
  }
};

// Customer Analytics Reducer
export const customerAnalyticsReducer = (
  state = {
    loading: false,
    data: null,
    error: null,
  },
  action
) => {
  switch (action.type) {
    case CUSTOMER_ANALYTICS_REQUEST:
      return { loading: true, data: null, error: null };
    case CUSTOMER_ANALYTICS_SUCCESS:
      return {
        loading: false,
        data: {
          customerSegments: action.payload.customerSegments || [],
          customerAcquisition: action.payload.customerAcquisition || [],
          segmentSummary: action.payload.segmentSummary || {},
          metrics: action.payload.metrics || {},
          topCustomers: action.payload.topCustomers || [],
          dateRange: action.payload.dateRange,
        },
        error: null,
      };
    case CUSTOMER_ANALYTICS_FAIL:
      return { loading: false, data: null, error: action.payload };
    case CUSTOMER_ANALYTICS_RESET:
      return { loading: false, data: null, error: null };
    default:
      return state;
  }
};

// Order Analytics Reducer
export const orderAnalyticsReducer = (
  state = {
    loading: false,
    data: null,
    error: null,
  },
  action
) => {
  switch (action.type) {
    case ORDER_ANALYTICS_REQUEST:
      return { loading: true, data: null, error: null };
    case ORDER_ANALYTICS_SUCCESS:
      return {
        loading: false,
        data: {
          statusBreakdown: action.payload.statusBreakdown || {},
          orderValueRanges: action.payload.orderValueRanges || {},
          paymentMethodStats: action.payload.paymentMethodStats || {},
          orderPatterns: action.payload.orderPatterns || { byDay: {}, byHour: {} },
          shippingStats: action.payload.shippingStats || {},
          deliveryMetrics: action.payload.deliveryMetrics || {},
          recentOrders: action.payload.recentOrders || [],
          dateRange: action.payload.dateRange,
        },
        error: null,
      };
    case ORDER_ANALYTICS_FAIL:
      return { loading: false, data: null, error: action.payload };
    case ORDER_ANALYTICS_RESET:
      return { loading: false, data: null, error: null };
    default:
      return state;
  }
};

// Financial Summary Reducer
export const financialSummaryReducer = (
  state = {
    loading: false,
    data: null,
    error: null,
  },
  action
) => {
  switch (action.type) {
    case FINANCIAL_SUMMARY_REQUEST:
      return { loading: true, data: null, error: null };
    case FINANCIAL_SUMMARY_SUCCESS:
      return {
        loading: false,
        data: {
          revenue: action.payload.revenue || {},
          profitability: action.payload.profitability || {},
          metrics: action.payload.metrics || {},
          monthlyFinancials: action.payload.monthlyFinancials || [],
          paymentMethodRevenue: action.payload.paymentMethodRevenue || [],
          cashFlow: action.payload.cashFlow || {},
          dateRange: action.payload.dateRange,
        },
        error: null,
      };
    case FINANCIAL_SUMMARY_FAIL:
      return { loading: false, data: null, error: action.payload };
    case FINANCIAL_SUMMARY_RESET:
      return { loading: false, data: null, error: null };
    default:
      return state;
  }
};
// import axios from 'axios';
// import {
//   SALES_ANALYTICS_REQUEST,
//   SALES_ANALYTICS_SUCCESS,
//   SALES_ANALYTICS_FAIL,
//   PRODUCT_ANALYTICS_REQUEST,
//   PRODUCT_ANALYTICS_SUCCESS,
//   PRODUCT_ANALYTICS_FAIL,
//   CUSTOMER_ANALYTICS_REQUEST,
//   CUSTOMER_ANALYTICS_SUCCESS,
//   CUSTOMER_ANALYTICS_FAIL,
//   ORDER_ANALYTICS_REQUEST,
//   ORDER_ANALYTICS_SUCCESS,
//   ORDER_ANALYTICS_FAIL,
//   FINANCIAL_SUMMARY_REQUEST,
//   FINANCIAL_SUMMARY_SUCCESS,
//   FINANCIAL_SUMMARY_FAIL,
// } from '../constants/reportConstants';
// import { logout } from './userActions';

// // Get sales analytics
// export const getSalesAnalytics =
//   (startDate = '', endDate = '') =>
//   async (dispatch, getState) => {
//     try {
//       dispatch({ type: SALES_ANALYTICS_REQUEST });

//       const {
//         userLogin: { userInfo },
//       } = getState();

//       const config = {
//         headers: {
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       };

//       const { data } = await axios.get(
//         `/api/reports/sales-analytics?startDate=${startDate}&endDate=${endDate}`,
//         config
//       );

//       dispatch({
//         type: SALES_ANALYTICS_SUCCESS,
//         payload: data,
//       });
//     } catch (error) {
//       const message =
//         error.response && error.response.data.message ? error.response.data.message : error.message;
//       if (error.response && error.response.status === 401) {
//         dispatch(logout());
//       }
//       dispatch({
//         type: SALES_ANALYTICS_FAIL,
//         payload: message,
//       });
//     }
//   };

// // Get product analytics
// export const getProductAnalytics =
//   (startDate = '', endDate = '') =>
//   async (dispatch, getState) => {
//     try {
//       dispatch({ type: PRODUCT_ANALYTICS_REQUEST });

//       const {
//         userLogin: { userInfo },
//       } = getState();

//       const config = {
//         headers: {
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       };

//       const { data } = await axios.get(
//         `/api/reports/product-analytics?startDate=${startDate}&endDate=${endDate}`,
//         config
//       );

//       dispatch({
//         type: PRODUCT_ANALYTICS_SUCCESS,
//         payload: data,
//       });
//     } catch (error) {
//       const message =
//         error.response && error.response.data.message ? error.response.data.message : error.message;
//       if (error.response && error.response.status === 401) {
//         dispatch(logout());
//       }
//       dispatch({
//         type: PRODUCT_ANALYTICS_FAIL,
//         payload: message,
//       });
//     }
//   };

// // Get customer analytics
// export const getCustomerAnalytics =
//   (startDate = '', endDate = '') =>
//   async (dispatch, getState) => {
//     try {
//       dispatch({ type: CUSTOMER_ANALYTICS_REQUEST });

//       const {
//         userLogin: { userInfo },
//       } = getState();

//       const config = {
//         headers: {
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       };

//       const { data } = await axios.get(
//         `/api/reports/customer-analytics?startDate=${startDate}&endDate=${endDate}`,
//         config
//       );

//       dispatch({
//         type: CUSTOMER_ANALYTICS_SUCCESS,
//         payload: data,
//       });
//     } catch (error) {
//       const message =
//         error.response && error.response.data.message ? error.response.data.message : error.message;
//       if (error.response && error.response.status === 401) {
//         dispatch(logout());
//       }
//       dispatch({
//         type: CUSTOMER_ANALYTICS_FAIL,
//         payload: message,
//       });
//     }
//   };

// // Get order analytics
// export const getOrderAnalytics =
//   (startDate = '', endDate = '') =>
//   async (dispatch, getState) => {
//     try {
//       dispatch({ type: ORDER_ANALYTICS_REQUEST });

//       const {
//         userLogin: { userInfo },
//       } = getState();

//       const config = {
//         headers: {
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       };

//       const { data } = await axios.get(
//         `/api/reports/order-analytics?startDate=${startDate}&endDate=${endDate}`,
//         config
//       );

//       dispatch({
//         type: ORDER_ANALYTICS_SUCCESS,
//         payload: data,
//       });
//     } catch (error) {
//       const message =
//         error.response && error.response.data.message ? error.response.data.message : error.message;
//       if (error.response && error.response.status === 401) {
//         dispatch(logout());
//       }
//       dispatch({
//         type: ORDER_ANALYTICS_FAIL,
//         payload: message,
//       });
//     }
//   };

// // Get financial summary
// export const getFinancialSummary =
//   (startDate = '', endDate = '') =>
//   async (dispatch, getState) => {
//     try {
//       dispatch({ type: FINANCIAL_SUMMARY_REQUEST });

//       const {
//         userLogin: { userInfo },
//       } = getState();

//       const config = {
//         headers: {
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       };

//       const { data } = await axios.get(
//         `/api/reports/financial-summary?startDate=${startDate}&endDate=${endDate}`,
//         config
//       );

//       dispatch({
//         type: FINANCIAL_SUMMARY_SUCCESS,
//         payload: data,
//       });
//     } catch (error) {
//       const message =
//         error.response && error.response.data.message ? error.response.data.message : error.message;
//       if (error.response && error.response.status === 401) {
//         dispatch(logout());
//       }
//       dispatch({
//         type: FINANCIAL_SUMMARY_FAIL,
//         payload: message,
//       });
//     }
//   };
