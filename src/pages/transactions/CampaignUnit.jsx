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
import formattedDate from "../../utils/formattedDate";
const CampaignUnit = ({
  campaignUnitData,
  campaignLoading,
  filteredTrxData,
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  handleOpenModal,
  page,
}) => {
  console.log("currentPage", currentPage);
  console.log("totalPages", totalPages);
  console.log("page", page);
  console.log("campaignUnitData", campaignUnitData);

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
                <TableCell> Business Name</TableCell>
                <TableCell>Unit Type </TableCell>
                <TableCell>Total user in Campaigns</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaignLoading || !campaignUnitData?.results ? (
                <CircularProgress
                  size="4.2rem"
                  sx={{
                    color: "#02981D",
                    marginLeft: "auto",
                    padding: "1em",
                  }}
                />
              ) : campaignUnitData?.results &&
                Array.isArray(campaignUnitData?.results) &&
                campaignUnitData?.results?.length > 0 ? (
                campaignUnitData?.results?.map((item, i) => (
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
                    <TableCell>{item?.business_name}</TableCell>
                    <TableCell>{item?.unit_type}</TableCell>
                    <TableCell>{item?.total_users}</TableCell>
                    <TableCell>{formattedDate(item?.date)}</TableCell>

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
        // nextPageLink={transactionsData?.links?.next}
        // prevPageLink={transactionsData?.links?.previous}
      />
    </>
  );
};

export default CampaignUnit;
