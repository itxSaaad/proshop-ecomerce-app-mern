import { useEffect } from 'react';
import { Button, Card, Col, Image, ListGroup, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import Loader from '../components/Loader';

import {
  createOrder,
  createOrderAndPayWithStripe,
  resetOrderCreate,
  resetStripeCheckout,
} from '../actions/orderActions.js';

const PlaceOrderScreen = () => {
  const dispatch = useDispatch();
  const history = useNavigate();

  const cart = useSelector((state) => state.cart);

  //   Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };
  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  cart.shippingPrice = addDecimals(cart.itemsPrice > 100 ? 0 : 100);
  cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)));
  cart.totalPrice = (
    Number(cart.itemsPrice) +
    Number(cart.shippingPrice) +
    Number(cart.taxPrice)
  ).toFixed(2);

  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error } = orderCreate;

  const orderStripeCheckout = useSelector((state) => state.orderStripeCheckout);
  const { loading: stripeLoading, error: stripeError } = orderStripeCheckout;

  useEffect(() => {
    if (success && cart.paymentMethod === 'COD') {
      // For COD orders, redirect to order page immediately
      history(`/order/${order._id}`);
      dispatch(resetOrderCreate());
    }
    // eslint-disable-next-line
  }, [history, success, cart.paymentMethod]);

  // Reset any previous Stripe checkout state when component mounts
  useEffect(() => {
    dispatch(resetStripeCheckout());
    dispatch(resetOrderCreate());
  }, [dispatch]);

  const placeOrderHandler = () => {
    if (cart.paymentMethod === 'Stripe') {
      // For Stripe, create order and redirect to Stripe checkout
      dispatch(
        createOrderAndPayWithStripe({
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        })
      );
    } else {
      // For COD, just create order
      dispatch(
        createOrder({
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        })
      );
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Address: </strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city},{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {cart.paymentMethod}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your Cart is Empty!</Message>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item, index) => (
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
                  <Col>${cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${cart.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {(error || stripeError) && (
                <ListGroup.Item>
                  <Message variant="danger">{error || stripeError}</Message>
                </ListGroup.Item>
              )}

              <ListGroup.Item>
                {stripeLoading ? (
                  <div className="d-flex align-items-center">
                    <Loader />
                    <span className="ms-2">Redirecting to payment...</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="btn-block"
                    disabled={cart.cartItems.length === 0}
                    onClick={placeOrderHandler}
                    style={{
                      backgroundColor: cart.paymentMethod === 'Stripe' ? '#635bff' : undefined,
                      borderColor: cart.paymentMethod === 'Stripe' ? '#635bff' : undefined,
                    }}
                  >
                    {cart.paymentMethod === 'Stripe'
                      ? 'Place Order & Pay with Stripe'
                      : 'Place Order'}
                  </Button>
                )}
              </ListGroup.Item>

              {cart.paymentMethod === 'Stripe' && (
                <ListGroup.Item>
                  <div className="d-flex align-items-center text-muted">
                    <i className="fas fa-lock me-2"></i>
                    <small>Secure payment powered by Stripe</small>
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
