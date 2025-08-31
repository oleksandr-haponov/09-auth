import ReactPaginate from "react-paginate";
import css from '../Pagination/Pagination.module.css';
interface PaginationProps {
 page: number;
 total: number;
 onChange: (nextPage: number) => void
}

export default function Pagination ({page, total, onChange}: PaginationProps){

  return (
   <ReactPaginate
     pageCount={total}
     pageRangeDisplayed={5}
     marginPagesDisplayed={1}
     onPageChange={({ selected }) => onChange(selected + 1)}
     forcePage={page - 1}
     containerClassName={css.pagination}
     activeClassName={css.active}
     breakLabel="..."
     nextLabel="→"
     previousLabel="←"
/>
  )
}