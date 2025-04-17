
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface FilterOptions {
  employeeId: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  minPoints: string;
  maxPoints: string;
}

interface TaskFiltersProps {
  users: User[];
  onFilterChange: (filters: FilterOptions) => void;
  isAdmin: boolean;
}

const TaskFilters = ({ users, onFilterChange, isAdmin }: TaskFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    employeeId: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    minPoints: "",
    maxPoints: "",
  });

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleFilterChange("search", value);
  };

  const clearFilters = () => {
    const resetFilters: FilterOptions = {
      employeeId: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      minPoints: "",
      maxPoints: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_300px_auto]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by task title..."
              className="pl-8"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          {isAdmin && (
            <Select
              value={filters.employeeId}
              onValueChange={(value) => handleFilterChange("employeeId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All employees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="date-from" className="sr-only">
                        From
                      </Label>
                      <Input
                        id="date-from"
                        type="date"
                        placeholder="From"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-to" className="sr-only">
                        To
                      </Label>
                      <Input
                        id="date-to"
                        type="date"
                        placeholder="To"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-points">Points Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-points" className="sr-only">
                        Min Points
                      </Label>
                      <Input
                        id="min-points"
                        type="number"
                        placeholder="Min"
                        min={0}
                        value={filters.minPoints}
                        onChange={(e) => handleFilterChange("minPoints", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-points" className="sr-only">
                        Max Points
                      </Label>
                      <Input
                        id="max-points"
                        type="number"
                        placeholder="Max"
                        min={0}
                        value={filters.maxPoints}
                        onChange={(e) => handleFilterChange("maxPoints", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button variant="secondary" onClick={clearFilters}>
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskFilters;
