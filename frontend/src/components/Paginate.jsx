import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Paginate = ({ pages, page, isAdmin = false, keyword = '', adminPath = 'productlist' }) => {
  return (
    pages > 1 && (
      <Pagination>
        {[...Array(pages).keys()].map((x) => {
          let linkTo;

          if (!isAdmin) {
            // Public pages (HomeScreen)
            linkTo = keyword ? `/search/${keyword}/page/${x + 1}` : `/page/${x + 1}`;
          } else {
            // Admin pages
            switch (adminPath) {
              case 'productlist':
                linkTo = `/admin/productlist/${x + 1}`;
                break;
              case 'userlist':
                linkTo = `/admin/userlist/${x + 1}`;
                break;
              case 'orderlist':
                linkTo = `/admin/orderlist/${x + 1}`;
                break;
              default:
                linkTo = `/admin/${adminPath}/${x + 1}`;
            }
          }

          return (
            <LinkContainer key={x + 1} to={linkTo}>
              <Pagination.Item active={x + 1 === page}>{x + 1}</Pagination.Item>
            </LinkContainer>
          );
        })}
      </Pagination>
    )
  );
};

export default Paginate;
