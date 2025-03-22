type RowObj = {
  name: string;
  status: string;
  date: string;
  progress: number;
};

const tableDataComplex: RowObj[] = [
  {
    name: 'Arayan pahuja',
    progress: 45,
    status: 'Approved',
    date: '12 Jan 2021',
  },
  {
    name: 'Rohit',
    progress: 96.5,
    status: 'Disable',
    date: '21 Feb 2021',
  },
  {
    name: 'Priyanshu',
    progress: 57,
    status: 'Error',
    date: '13 Mar 2021',
  },
  {
    name: 'Mohit',
    progress: 80,
    status: 'Approved',
    date: '24 Oct 2022',
  },
];
export default tableDataComplex;
