import axios from 'axios';
import {
  SALES_ANALYTICS_REQUEST,
  SALES_ANALYTICS_SUCCESS,
  SALES_ANALYTICS_FAIL,
  PRODUCT_ANALYTICS_REQUEST,
  PRODUCT_ANALYTICS_SUCCESS,
  PRODUCT_ANALYTICS_FAIL,
  CUSTOMER_ANALYTICS_REQUEST,
  CUSTOMER_ANALYTICS_SUCCESS,
  CUSTOMER_ANALYTICS_FAIL,
  ORDER_ANALYTICS_REQUEST,
  ORDER_ANALYTICS_SUCCESS,
  ORDER_ANALYTICS_FAIL,
  FINANCIAL_SUMMARY_REQUEST,
  FINANCIAL_SUMMARY_SUCCESS,
  FINANCIAL_SUMMARY_FAIL,
} from '../constants/reportConstants.js';

// Get Sales Analytics
export const getSalesAnalytics =
  (startDate = '', endDate = '') =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: SALES_ANALYTICS_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const { data } = await axios.get(
        `/api/reports/sales-analytics?${queryParams.toString()}`,
        config
      );

      dispatch({
        type: SALES_ANALYTICS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: SALES_ANALYTICS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Get Product Analytics
export const getProductAnalytics =
  (startDate = '', endDate = '') =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: PRODUCT_ANALYTICS_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const { data } = await axios.get(
        `/api/reports/product-analytics?${queryParams.toString()}`,
        config
      );

      dispatch({
        type: PRODUCT_ANALYTICS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: PRODUCT_ANALYTICS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Get Customer Analytics
export const getCustomerAnalytics =
  (startDate = '', endDate = '') =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: CUSTOMER_ANALYTICS_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const { data } = await axios.get(
        `/api/reports/customer-analytics?${queryParams.toString()}`,
        config
      );

      dispatch({
        type: CUSTOMER_ANALYTICS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CUSTOMER_ANALYTICS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Get Order Analytics
export const getOrderAnalytics =
  (startDate = '', endDate = '') =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_ANALYTICS_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const { data } = await axios.get(
        `/api/reports/order-analytics?${queryParams.toString()}`,
        config
      );

      dispatch({
        type: ORDER_ANALYTICS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: ORDER_ANALYTICS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Get Financial Summary
export const getFinancialSummary =
  (startDate = '', endDate = '') =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: FINANCIAL_SUMMARY_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const { data } = await axios.get(
        `/api/reports/financial-summary?${queryParams.toString()}`,
        config
      );

      dispatch({
        type: FINANCIAL_SUMMARY_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: FINANCIAL_SUMMARY_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };
