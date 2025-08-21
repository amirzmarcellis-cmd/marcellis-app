import { useCompanyContext } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function CompanySwitcher() {
  const { companies, currentCompany, switchCompany, loading } = useCompanyContext();

  if (loading || !currentCompany) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (companies.length <= 1) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">{currentCompany.name}</span>
        <Badge variant="secondary" className="text-xs">
          {currentCompany.plan_type}
        </Badge>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium">{currentCompany.name}</span>
          <Badge variant="secondary" className="text-xs">
            {currentCompany.plan_type}
          </Badge>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => switchCompany(company)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{company.name}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {company.plan_type}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}