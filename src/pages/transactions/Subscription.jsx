import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CustomPagination from "../../components/CustomPagination";
const Subscription = ({
  subscriptionLoading,
  subscriptionData,
  currentPage,
  totalPages,
  onPageChange,

  rowsPerPage,
  handleOpenModal,
  page,
}) => {
  function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) {
      return "N/A";
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 365 || diffDays === 366) {
      return "1 year";
    }
    return `${diffDays} days`;
  }

  console.log("subscriptionData", subscriptionData);
  // console.log("rowsPerPage", rowsPerPage);
  // console.log("page", page);
  return (
    <>
      {/* table */}
      <Box className="w-full">
        <TableContainer>
          <Table sx={{ minWidth: 100, padding: "8px" }}>
            <TableHead
              sx={{
                background: "#F8F8F8",
              }}
            >
              <TableRow>
                <TableCell>S/N</TableCell>
                <TableCell> Merchant Name</TableCell>
                <TableCell>Subscription Type</TableCell>
                <TableCell>Subscription Duration</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptionLoading || !subscriptionData?.results ? (
                <CircularProgress
                  size="4.2rem"
                  sx={{
                    color: "#02981D",
                    marginLeft: "auto",
                    padding: "1em",
                  }}
                />
              ) : subscriptionData?.results &&
                Array.isArray(subscriptionData?.results) &&
                subscriptionData?.results?.length > 0 ? (
                subscriptionData?.results?.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: "400",
                          fontSize: "16px",
                          color: "#5E5E5E",
                        }}
                      >
                        {item?.merchant}
                      </Typography>
                    </TableCell>
                    <TableCell>{item?.plan}</TableCell>
                    <TableCell>
                      {calculateDuration(item.start_date, item.end_date)}
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() => handleOpenModal(item)}
                        variant="outlined"
                        sx={{
                          textTransform: "capitalize",
                          display: "flex",
                          gap: "4px",
                          width: "100px",
                          alignItems: "center",
                          color: "#3F3767",
                          fontWeight: "400",
                          fontSize: "10px",
                          border: "1px solid #3F3767",
                          "&:hover": {
                            backgroundColor: "#fafafa",
                            border: "1px solid #E0E0E0",
                          },
                          // lineHeight: "26.4px",
                        }}
                      >
                        View More
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>No data found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* table end */}
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        // nextPageLink={subscriptionData?.links?.next}
        // prevPageLink={transactionsData?.links?.previous}
      />
    </>
  );
};

export default Subscription;
