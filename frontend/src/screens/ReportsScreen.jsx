import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  getCustomerAnalytics,
  getFinancialSummary,
  getOrderAnalytics,
  getProductAnalytics,
  getSalesAnalytics,
} from '../actions/reportActions.js';

import Loader from '../components/Loader';
import Message from '../components/Message';

const EnhancedReportsScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Date filtering state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('sales');

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Report data selectors
  const salesAnalytics = useSelector((state) => state.salesAnalytics);
  const { loading: loadingSales, error: errorSales, data: salesData } = salesAnalytics;

  const productAnalytics = useSelector((state) => state.productAnalytics);
  const { loading: loadingProducts, error: errorProducts, data: productData } = productAnalytics;

  const customerAnalytics = useSelector((state) => state.customerAnalytics);
  const {
    loading: loadingCustomers,
    error: errorCustomers,
    data: customerData,
  } = customerAnalytics;

  const orderAnalytics = useSelector((state) => state.orderAnalytics);
  const { loading: loadingOrders, error: errorOrders, data: orderData } = orderAnalytics;

  const financialSummary = useSelector((state) => state.financialSummary);
  const {
    loading: loadingFinancial,
    error: errorFinancial,
    data: financialData,
  } = financialSummary;

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
    } else {
      loadAllReports();
    }
  }, [dispatch, navigate, userInfo]);

  const loadAllReports = () => {
    dispatch(getSalesAnalytics(startDate, endDate));
    dispatch(getProductAnalytics(startDate, endDate));
    dispatch(getCustomerAnalytics(startDate, endDate));
    dispatch(getOrderAnalytics(startDate, endDate));
    dispatch(getFinancialSummary(startDate, endDate));
  };

  const handleDateFilter = () => {
    loadAllReports();
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    dispatch(getSalesAnalytics());
    dispatch(getProductAnalytics());
    dispatch(getCustomerAnalytics());
    dispatch(getOrderAnalytics());
    dispatch(getFinancialSummary());
  };

  const downloadPDF = (reportType, data) => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    const dateRangeText =
      startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : 'Date Range: All Time';

    let content = `
      <html>
        <head>
          <title>${reportType} Analytics Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #007bff; margin: 0; font-size: 28px; }
            .header p { margin: 5px 0; color: #666; }
            .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .metric { display: inline-block; margin: 10px 20px; text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #007bff; color: white; font-weight: 600; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            .growth-positive { color: #28a745; }
            .growth-negative { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ProShop Analytics</h1>
            <h2>${reportType} Report</h2>
            <p>Generated on: ${currentDate}</p>
            <p>${dateRangeText}</p>
          </div>
    `;

    switch (reportType) {
      case 'Sales Analytics':
        content += `
          <div class="summary-card">
            <h3>Sales Summary</h3>
            <div class="metric">
              <div class="metric-value">$${data?.summary?.totalRevenue?.toLocaleString() || 0}</div>
              <div class="metric-label">Total Revenue</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data?.summary?.totalOrders || 0}</div>
              <div class="metric-label">Total Orders</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${data?.summary?.averageOrderValue || 0}</div>
              <div class="metric-label">Average Order Value</div>
            </div>
            <div class="metric">
              <div class="metric-value ${
                data?.summary?.revenueGrowth >= 0 ? 'growth-positive' : 'growth-negative'
              }">
                ${data?.summary?.revenueGrowth?.toFixed(1) || 0}%
              </div>
              <div class="metric-label">Revenue Growth</div>
            </div>
          </div>
          
          <h3>Monthly Performance</h3>
          <table>
            <tr><th>Period</th><th>Revenue</th><th>Orders</th></tr>
            ${
              data?.monthlyComparison
                ?.map(
                  (item) =>
                    `<tr><td>${item.period}</td><td>$${item.revenue.toLocaleString()}</td><td>${
                      item.orders
                    }</td></tr>`
                )
                .join('') || '<tr><td colspan="3">No data available</td></tr>'
            }
          </table>
        `;
        break;

      case 'Product Analytics':
        content += `
          <div class="summary-card">
            <h3>Product Performance Overview</h3>
            <div class="metric">
              <div class="metric-value">${data?.metrics?.totalProducts || 0}</div>
              <div class="metric-label">Total Products</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${
                data?.metrics?.totalInventoryValue?.toLocaleString() || 0
              }</div>
              <div class="metric-label">Inventory Value</div>
            </div>
          </div>
          
          <h3>Top Performing Products</h3>
          <table>
            <tr><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Stock</th></tr>
            ${
              data?.topPerformers
                ?.slice(0, 10)
                .map(
                  (product) =>
                    `<tr>
                <td>${product.name}</td>
                <td>${product.totalSold}</td>
                <td>$${product.totalRevenue.toLocaleString()}</td>
                <td>${product.currentStock}</td>
              </tr>`
                )
                .join('') || '<tr><td colspan="4">No data available</td></tr>'
            }
          </table>
        `;
        break;

      case 'Customer Analytics':
        content += `
          <div class="summary-card">
            <h3>Customer Overview</h3>
            <div class="metric">
              <div class="metric-value">${data?.metrics?.totalCustomers || 0}</div>
              <div class="metric-label">Total Customers</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data?.metrics?.retentionRate || 0}%</div>
              <div class="metric-label">Retention Rate</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${data?.metrics?.avgCustomerValue || 0}</div>
              <div class="metric-label">Avg Customer Value</div>
            </div>
          </div>
          
          <h3>Top Customers</h3>
          <table>
            <tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total Spent</th></tr>
            ${
              data?.topCustomers
                ?.slice(0, 15)
                .map(
                  (customer) =>
                    `<tr>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.orderCount}</td>
                <td>$${customer.totalSpent.toLocaleString()}</td>
              </tr>`
                )
                .join('') || '<tr><td colspan="4">No data available</td></tr>'
            }
          </table>
        `;
        break;

      case 'Financial Summary':
        content += `
          <div class="summary-card">
            <h3>Financial Overview</h3>
            <div class="metric">
              <div class="metric-value">$${data?.revenue?.gross?.toLocaleString() || 0}</div>
              <div class="metric-label">Gross Revenue</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${data?.revenue?.net?.toLocaleString() || 0}</div>
              <div class="metric-label">Net Revenue</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${
                data?.profitability?.grossProfit?.toLocaleString() || 0
              }</div>
              <div class="metric-label">Gross Profit</div>
            </div>
            <div class="metric">
              <div class="metric-value">${
                data?.profitability?.grossProfitMargin?.toFixed(1) || 0
              }%</div>
              <div class="metric-label">Profit Margin</div>
            </div>
          </div>
        `;
        break;
    }

    content += `
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const renderMetricCard = (title, value, subtitle, trend, color = 'primary') => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="text-center">
        <div className={`text-${color} mb-2`}>
          <h2 className="mb-0">{value}</h2>
        </div>
        <h6 className="text-muted mb-0">{title}</h6>
        {subtitle && <small className="text-muted">{subtitle}</small>}
        {trend && (
          <div className={`mt-2 text-${trend >= 0 ? 'success' : 'danger'}`}>
            <i className={`fas fa-arrow-${trend >= 0 ? 'up' : 'down'} me-1`}></i>
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary">
            <i className="fas fa-chart-line me-2"></i>
            Business Intelligence Dashboard
          </h1>
        </Col>
      </Row>

      {/* Date Filter Controls */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleDateFilter}
                  disabled={
                    loadingSales ||
                    loadingProducts ||
                    loadingCustomers ||
                    loadingOrders ||
                    loadingFinancial
                  }
                >
                  <i className="fas fa-filter me-1"></i>
                  Apply Filter
                </Button>
                <Button variant="outline-secondary" onClick={clearDateFilter}>
                  <i className="fas fa-times me-1"></i>
                  Clear
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabbed Interface */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4" fill>
        {/* Sales Analytics Tab */}
        <Tab
          eventKey="sales"
          title={
            <>
              <i className="fas fa-chart-line me-2"></i>Sales Analytics
            </>
          }
        >
          {loadingSales ? (
            <Loader />
          ) : errorSales ? (
            <Message variant="danger">{errorSales}</Message>
          ) : salesData ? (
            <>
              {/* Summary Cards */}
              <Row className="mb-4">
                <Col md={3}>
                  {renderMetricCard(
                    'Total Revenue',
                    `$${salesData.summary?.totalRevenue?.toLocaleString() || 0}`,
                    'Gross revenue',
                    salesData.summary?.revenueGrowth
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Total Orders',
                    salesData.summary?.totalOrders?.toLocaleString() || 0,
                    'All orders',
                    salesData.summary?.orderGrowth,
                    'success'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Average Order Value',
                    `$${salesData.summary?.averageOrderValue || 0}`,
                    'Per order',
                    null,
                    'info'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Paid Revenue',
                    `$${salesData.summary?.paidRevenue?.toLocaleString() || 0}`,
                    'Collected payments',
                    null,
                    'warning'
                  )}
                </Col>
              </Row>

              {/* Charts and Tables */}
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between">
                      <h5>
                        <i className="fas fa-credit-card me-2"></i>Payment Methods
                      </h5>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => downloadPDF('Sales Analytics', salesData)}
                      >
                        <i className="fas fa-download me-1"></i>PDF
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      {Object.entries(salesData.paymentMethods || {}).map(([method, count]) => (
                        <div
                          key={method}
                          className="d-flex justify-content-between align-items-center mb-2"
                        >
                          <span className="fw-medium">{method}</span>
                          <Badge bg="primary" pill>
                            {count} orders
                          </Badge>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>
                        <i className="fas fa-calendar me-2"></i>Monthly Trends
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Revenue</th>
                            <th>Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.monthlyComparison?.slice(-6).map((item) => (
                            <tr key={item.period}>
                              <td>{item.period}</td>
                              <td>${item.revenue.toLocaleString()}</td>
                              <td>{item.orders}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="info">No sales data available for the selected period.</Alert>
          )}
        </Tab>

        {/* Product Analytics Tab */}
        <Tab
          eventKey="products"
          title={
            <>
              <i className="fas fa-box me-2"></i>Product Analytics
            </>
          }
        >
          {loadingProducts ? (
            <Loader />
          ) : errorProducts ? (
            <Message variant="danger">{errorProducts}</Message>
          ) : productData ? (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  {renderMetricCard(
                    'Total Products',
                    productData.metrics?.totalProducts || 0,
                    'In catalog'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Inventory Value',
                    `$${productData.metrics?.totalInventoryValue?.toLocaleString() || 0}`,
                    'Total stock value',
                    null,
                    'success'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Avg Rating',
                    productData.metrics?.avgProductRating?.toFixed(1) || '0.0',
                    'Product rating',
                    null,
                    'warning'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Categories',
                    productData.categoryAnalysis?.length || 0,
                    'Product categories',
                    null,
                    'info'
                  )}
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between">
                      <h5>
                        <i className="fas fa-trophy me-2"></i>Top Performing Products
                      </h5>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => downloadPDF('Product Analytics', productData)}
                      >
                        <i className="fas fa-download me-1"></i>PDF
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Sold</th>
                            <th>Revenue</th>
                            <th>Stock</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productData.topPerformers?.slice(0, 10).map((product) => (
                            <tr key={product.productId}>
                              <td className="fw-medium">{product.name}</td>
                              <td>
                                <Badge bg="info">{product.totalSold}</Badge>
                              </td>
                              <td>${product.totalRevenue.toLocaleString()}</td>
                              <td>
                                <Badge
                                  bg={
                                    product.currentStock > 10
                                      ? 'success'
                                      : product.currentStock > 0
                                      ? 'warning'
                                      : 'danger'
                                  }
                                >
                                  {product.currentStock}
                                </Badge>
                              </td>
                              <td>
                                {product.currentStock > 10 ? (
                                  <Badge bg="success">In Stock</Badge>
                                ) : product.currentStock > 0 ? (
                                  <Badge bg="warning">Low Stock</Badge>
                                ) : (
                                  <Badge bg="danger">Out of Stock</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>
                        <i className="fas fa-warehouse me-2"></i>Stock Status
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      {Object.entries(productData.stockSummary || {}).map(([status, count]) => (
                        <div
                          key={status}
                          className="d-flex justify-content-between align-items-center mb-3"
                        >
                          <span>{status}</span>
                          <Badge
                            bg={
                              status === 'Out of Stock'
                                ? 'danger'
                                : status === 'Low Stock'
                                ? 'warning'
                                : 'success'
                            }
                            pill
                          >
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="info">No product data available for the selected period.</Alert>
          )}
        </Tab>

        {/* Customer Analytics Tab */}
        <Tab
          eventKey="customers"
          title={
            <>
              <i className="fas fa-users me-2"></i>Customer Analytics
            </>
          }
        >
          {loadingCustomers ? (
            <Loader />
          ) : errorCustomers ? (
            <Message variant="danger">{errorCustomers}</Message>
          ) : customerData ? (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  {renderMetricCard(
                    'Total Customers',
                    customerData.metrics?.totalCustomers || 0,
                    'Registered users'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Retention Rate',
                    `${customerData.metrics?.retentionRate || 0}%`,
                    'Repeat customers',
                    null,
                    'success'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Avg Customer Value',
                    `$${customerData.metrics?.avgCustomerValue || 0}`,
                    'Per customer',
                    null,
                    'warning'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Customer LTV',
                    `$${customerData.metrics?.customerLifetimeValue || 0}`,
                    'Lifetime value',
                    null,
                    'info'
                  )}
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between">
                      <h5>
                        <i className="fas fa-crown me-2"></i>Top Customers
                      </h5>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => downloadPDF('Customer Analytics', customerData)}
                      >
                        <i className="fas fa-download me-1"></i>PDF
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Orders</th>
                            <th>Total Spent</th>
                            <th>Avg Order</th>
                            <th>Segment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerData.topCustomers?.slice(0, 15).map((customer) => (
                            <tr key={customer.customerId}>
                              <td>
                                <div>
                                  <strong>{customer.name}</strong>
                                  <br />
                                  <small className="text-muted">{customer.email}</small>
                                </div>
                              </td>
                              <td>
                                <Badge bg="primary">{customer.orderCount}</Badge>
                              </td>
                              <td>${customer.totalSpent.toLocaleString()}</td>
                              <td>${customer.avgOrderValue}</td>
                              <td>
                                <Badge
                                  bg={
                                    customer.segment === 'VIP'
                                      ? 'danger'
                                      : customer.segment === 'Premium'
                                      ? 'warning'
                                      : customer.segment === 'Regular'
                                      ? 'info'
                                      : 'secondary'
                                  }
                                >
                                  {customer.segment}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>
                        <i className="fas fa-chart-pie me-2"></i>Customer Segments
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      {Object.entries(customerData.segmentSummary || {}).map(([segment, count]) => (
                        <div
                          key={segment}
                          className="d-flex justify-content-between align-items-center mb-3"
                        >
                          <span>{segment}</span>
                          <Badge
                            bg={
                              segment === 'VIP'
                                ? 'danger'
                                : segment === 'Premium'
                                ? 'warning'
                                : segment === 'Regular'
                                ? 'info'
                                : 'secondary'
                            }
                            pill
                          >
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="info">No customer data available for the selected period.</Alert>
          )}
        </Tab>

        {/* Order Analytics Tab */}
        <Tab
          eventKey="orders"
          title={
            <>
              <i className="fas fa-shopping-cart me-2"></i>Order Analytics
            </>
          }
        >
          {loadingOrders ? (
            <Loader />
          ) : errorOrders ? (
            <Message variant="danger">{errorOrders}</Message>
          ) : orderData ? (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  {renderMetricCard(
                    'Total Orders',
                    orderData.statusBreakdown?.total || 0,
                    'All orders'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Delivery Rate',
                    `${orderData.deliveryMetrics?.deliveryRate || 0}%`,
                    'Orders delivered',
                    null,
                    'success'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Avg Delivery Time',
                    `${orderData.deliveryMetrics?.avgDeliveryTime || 0} days`,
                    'From payment',
                    null,
                    'warning'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Avg Shipping Cost',
                    `$${orderData.shippingStats?.avgShippingCost?.toFixed(2) || 0}`,
                    'Per order',
                    null,
                    'info'
                  )}
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>
                        <i className="fas fa-chart-bar me-2"></i>Order Status
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Paid Orders</span>
                          <strong>{orderData.statusBreakdown?.paid || 0}</strong>
                        </div>
                        <ProgressBar
                          variant="success"
                          now={
                            orderData.statusBreakdown?.total
                              ? (orderData.statusBreakdown.paid / orderData.statusBreakdown.total) *
                                100
                              : 0
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Delivered Orders</span>
                          <strong>{orderData.statusBreakdown?.delivered || 0}</strong>
                        </div>
                        <ProgressBar
                          variant="info"
                          now={
                            orderData.statusBreakdown?.total
                              ? (orderData.statusBreakdown.delivered /
                                  orderData.statusBreakdown.total) *
                                100
                              : 0
                          }
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between">
                      <h5>
                        <i className="fas fa-chart-pie me-2"></i>Order Value Distribution
                      </h5>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => downloadPDF('Order Analytics', orderData)}
                      >
                        <i className="fas fa-download me-1"></i>PDF
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      {Object.entries(orderData.orderValueRanges || {}).map(([range, count]) => (
                        <div
                          key={range}
                          className="d-flex justify-content-between align-items-center mb-2"
                        >
                          <span>{range}</span>
                          <Badge bg="primary" pill>
                            {count} orders
                          </Badge>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="info">No order data available for the selected period.</Alert>
          )}
        </Tab>

        {/* Financial Summary Tab */}
        <Tab
          eventKey="financial"
          title={
            <>
              <i className="fas fa-dollar-sign me-2"></i>Financial Summary
            </>
          }
        >
          {loadingFinancial ? (
            <Loader />
          ) : errorFinancial ? (
            <Message variant="danger">{errorFinancial}</Message>
          ) : financialData ? (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  {renderMetricCard(
                    'Gross Revenue',
                    `$${financialData.revenue?.gross?.toLocaleString() || 0}`,
                    'Total revenue'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Net Revenue',
                    `$${financialData.revenue?.net?.toLocaleString() || 0}`,
                    'After tax & shipping',
                    null,
                    'success'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Gross Profit',
                    `$${financialData.profitability?.grossProfit?.toLocaleString() || 0}`,
                    'Revenue - COGS',
                    null,
                    'warning'
                  )}
                </Col>
                <Col md={3}>
                  {renderMetricCard(
                    'Profit Margin',
                    `${financialData.profitability?.grossProfitMargin?.toFixed(1) || 0}%`,
                    'Gross profit margin',
                    null,
                    'info'
                  )}
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between">
                      <h5>
                        <i className="fas fa-money-bill-wave me-2"></i>Revenue Breakdown
                      </h5>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => downloadPDF('Financial Summary', financialData)}
                      >
                        <i className="fas fa-download me-1"></i>PDF
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Gross Revenue</span>
                        <strong>${financialData.revenue?.gross?.toLocaleString() || 0}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax Collected</span>
                        <span className="text-muted">
                          -${financialData.revenue?.tax?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Shipping Revenue</span>
                        <span className="text-muted">
                          -${financialData.revenue?.shipping?.toLocaleString() || 0}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Net Revenue</strong>
                        <strong className="text-success">
                          ${financialData.revenue?.net?.toLocaleString() || 0}
                        </strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>
                        <i className="fas fa-chart-line me-2"></i>Monthly Financial Trend
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Revenue</th>
                            <th>Net Revenue</th>
                            <th>Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialData.monthlyFinancials?.slice(-6).map((item) => (
                            <tr key={item.period}>
                              <td>{item.period}</td>
                              <td>${item.revenue?.toLocaleString()}</td>
                              <td>${item.netRevenue?.toLocaleString()}</td>
                              <td>{item.orders}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="info">No financial data available for the selected period.</Alert>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default EnhancedReportsScreen;
