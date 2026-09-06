"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BarLoader,
} from "react-spinners";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { bulkDeleteTransactions } from "@/actions/accounts";
import useFetch from "@/hooks/use-fetch";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { categoryColors } from "@/data/categories";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions = [] }) => {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleteResult,
  } = useFetch(bulkDeleteTransactions);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();

      result = result.filter((transaction) => {
        const description =
          transaction.description?.toLowerCase() ?? "";

        const category =
          transaction.category?.toLowerCase() ?? "";

        return (
          description.includes(searchLower) ||
          category.includes(searchLower)
        );
      });
    }

    // Recurring filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") {
          return transaction.isRecurring;
        }

        return !transaction.isRecurring;
      });
    }

    // Type filter
    if (typeFilter) {
      result = result.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison =
            new Date(a.date).getTime() -
            new Date(b.date).getTime();
          break;

        case "amount":
          comparison =
            Number(a.amount) - Number(b.amount);
          break;

        case "category":
          comparison = String(a.category ?? "").localeCompare(
            String(b.category ?? "")
          );
          break;

        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    transactions,
    searchTerm,
    typeFilter,
    recurringFilter,
    sortConfig,
  ]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field &&
        current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    if (
      selectedIds.length ===
      filteredAndSortedTransactions.length
    ) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(
      filteredAndSortedTransactions.map(
        (transaction) => transaction.id
      )
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} transaction${
        selectedIds.length > 1 ? "s" : ""
      }?`
    );

    if (!confirmed) return;

    deleteFn(selectedIds);
  };

  const handleDelete = (transactionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    deleteFn([transactionId]);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  useEffect(() => {
    if (!deleteResult || deleteLoading) return;

    if (deleteResult.success) {
      toast.success(
        `${deleteResult.deletedCount ?? "Selected"} transaction${
          deleteResult.deletedCount === 1 ? "" : "s"
        } deleted successfully`
      );

      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(
        deleteResult.error ?? "Failed to delete transactions"
      );
    }
  }, [deleteResult, deleteLoading, router]);

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader
          className="mt-4"
          width="100%"
          color="#9333ea"
        />
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Type */}
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="INCOME">
                Income
              </SelectItem>

              <SelectItem value="EXPENSE">
                Expense
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Recurring */}
          <Select
            value={recurringFilter}
            onValueChange={setRecurringFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="recurring">
                Recurring Only
              </SelectItem>

              <SelectItem value="non-recurring">
                Non-Recurring Only
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Delete Selected */}
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={deleteLoading}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}

          {/* Clear filters */}
          {(searchTerm ||
            typeFilter ||
            recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    filteredAndSortedTransactions.length > 0 &&
                    selectedIds.length ===
                      filteredAndSortedTransactions.length
                  }
                  aria-label="Select all transactions"
                />
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date

                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead>Description</TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category

                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount

                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead>Recurring</TableHead>

              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map(
                (transaction) => {
                  const isExpense =
                    transaction.type === "EXPENSE";

                  const categoryColor =
                    categoryColors?.[
                      transaction.category
                    ] ?? "#64748b";

                  const recurringLabel =
                    RECURRING_INTERVALS[
                      transaction.recurringInterval
                    ] ?? "Recurring";

                  return (
                    <TableRow key={transaction.id}>
                      {/* Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(
                            transaction.id
                          )}
                          onCheckedChange={() =>
                            handleSelect(transaction.id)
                          }
                          aria-label={`Select ${
                            transaction.description ??
                            "transaction"
                          }`}
                        />
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        {format(
                          new Date(transaction.date),
                          "PP"
                        )}
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        {transaction.description || "—"}
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <span
                          style={{
                            background: categoryColor,
                          }}
                          className="rounded px-2 py-1 text-sm text-white"
                        >
                          {transaction.category}
                        </span>
                      </TableCell>

                      {/* Amount */}
                      <TableCell
                        className="text-right font-medium"
                      >
                        <span
                          className={
                            isExpense
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {isExpense ? "-" : "+"}₹
                          {Number(
                            transaction.amount
                          ).toFixed(2)}
                        </span>
                      </TableCell>

                      {/* Recurring */}
                      <TableCell>
                        {transaction.isRecurring ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                                >
                                  <RefreshCw className="h-3 w-3" />

                                  {recurringLabel}
                                </Badge>
                              </TooltipTrigger>

                              {transaction.nextRecurringDate && (
                                <TooltipContent>
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      Next Date:
                                    </div>

                                    <div>
                                      {format(
                                        new Date(
                                          transaction.nextRecurringDate
                                        ),
                                        "PP"
                                      )}
                                    </div>
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1"
                          >
                            <Clock className="h-3 w-3" />
                            One-time
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              aria-label="Transaction actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/transaction/create?edit=${transaction.id}`
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleDelete(
                                  transaction.id
                                )
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                }
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;