import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/Loader';
import Message from '../components/Message';

import {
  getOrderDetails,
  deliverOrder,
  verifyStripePayment,
  payOrder,
} from '../actions/orderActions.js';
import { ORDER_DELIVER_RESET, ORDER_PAY_RESET } from '../constants/orderConstants.js';

const OrderScreen = () => {
  const { id } = useParams();
  const orderId = `${id}`;
  const dispatch = useDispatch();
  const history = useNavigate();
  const location = useLocation();

  // Get URL parameters for payment status
  const searchParams = new URLSearchParams(location.search);
  const paymentStatus = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');

  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay, error: errorPay } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  if (!loading && order) {
    //   Calculate prices
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2);
    };
    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
  }

  useEffect(() => {
    if (!userInfo) {
      history('/login');
    }

    if (!order || successDeliver || successPay || order._id !== orderId) {
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch({ type: ORDER_PAY_RESET });
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId, order, successDeliver, successPay, userInfo, history]);

  // Handle Stripe payment verification when user returns from checkout
  useEffect(() => {
    if (paymentStatus === 'success' && sessionId && order && !order.isPaid && !paymentVerified) {
      setPaymentVerified(true);
      dispatch(verifyStripePayment(orderId, sessionId))
        .then(() => {
          // Payment verification successful
          console.log('Payment verified successfully');
        })
        .catch((error) => {
          console.error('Payment verification failed:', error);
          setVerificationError('Failed to verify payment. Please contact support.');
        });
    }
  }, [paymentStatus, sessionId, order, orderId, dispatch, paymentVerified]);

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  // Function to render payment status alert
  const renderPaymentStatusAlert = () => {
    if (paymentStatus === 'success' && sessionId) {
      if (loadingPay) {
        return (
          <Alert variant="info" className="mb-3">
            <div className="d-flex align-items-center">
              <Loader />
              <span className="ms-2">Verifying your payment...</span>
            </div>
          </Alert>
        );
      }

      if (errorPay || verificationError) {
        return (
          <Alert variant="warning" className="mb-3">
            <Alert.Heading>Payment Verification Issue</Alert.Heading>
            <p>{errorPay || verificationError}</p>
            <p>Please refresh the page or contact support if the issue persists.</p>
          </Alert>
        );
      }

      if (order && order.isPaid) {
        return (
          <Alert variant="success" className="mb-3">
            <Alert.Heading>Payment Successful!</Alert.Heading>
            <p>Your payment has been processed successfully. Thank you for your order!</p>
          </Alert>
        );
      }
    } else if (paymentStatus === 'cancelled') {
      return (
        <Alert variant="warning" className="mb-3">
          <Alert.Heading>Payment Cancelled</Alert.Heading>
          <p>Your payment was cancelled. You can try again by creating a new order.</p>
        </Alert>
      );
    }
    return null;
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>

      {renderPaymentStatusAlert()}

      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                </Message>
              ) : (
                <Message variant="danger">Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                  {order.paymentResult && order.paymentResult.id && (
                    <>
                      <br />
                      Transaction ID: {order.paymentResult.id}
                    </>
                  )}
                </Message>
              ) : (
                <Message variant="danger">
                  Not Paid
                  {order.paymentMethod === 'COD' && (
                    <>
                      <br />
                      Payment will be collected upon delivery
                    </>
                  )}
                </Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {loadingDeliver && <Loader />}

              {/* Admin deliver button */}
              {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  <Button type="button" className="btn btn-block" onClick={deliverHandler}>
                    Mark As Delivered
                  </Button>
                </ListGroup.Item>
              )}

              {/* Manual payment button for admins on COD orders */}
              {userInfo && userInfo.isAdmin && !order.isPaid && order.paymentMethod === 'COD' && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="btn btn-block btn-success"
                    onClick={() =>
                      dispatch(
                        payOrder(order._id, {
                          id: 'cash_on_delivery',
                          status: 'completed',
                          update_time: new Date().toISOString(),
                          email_address: order.user.email,
                        })
                      )
                    }
                  >
                    Mark As Paid (COD)
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
