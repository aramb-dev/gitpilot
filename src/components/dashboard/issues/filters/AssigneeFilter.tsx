'use client';

import type { IssueUser } from '@/types/issue';
import { UserFilter } from './UserFilter';

interface AssigneeFilterProps {
  availableAssignees: IssueUser[];
  selectedAssignee: string | null;
  onChange: (assignee: string | null) => void;
  isLoading?: boolean;
}

export function AssigneeFilter({
  availableAssignees,
  selectedAssignee,
  onChange,
  isLoading = false,
}: AssigneeFilterProps) {
  return (
    <UserFilter
      label="ASSIGNEE"
      availableUsers={availableAssignees}
      selectedUser={selectedAssignee}
      onChange={onChange}
      isLoading={isLoading}
      noneLabel="NO_ASSIGNEE"
    />
  );
}
