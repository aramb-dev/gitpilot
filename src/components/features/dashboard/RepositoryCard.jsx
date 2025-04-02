import React from "react";
import { Card } from "../../common/Card";
import { Checkbox } from "../../common/Checkbox";
import { PrivateBadge, PublicBadge, Badge } from "../../common/Badge";
import {
  Lock,
  Unlock,
  Star,
  GitFork,
  Clock,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import { Button } from "../../common/Button";
import { formatDistanceToNow } from "date-fns";

const RepositoryCard = ({ repository, isSelected, onToggleSelection }) => {
  const {
    id,
    name,
    description,
    private: isPrivate,
    owner,
    html_url,
    stargazers_count,
    forks_count,
    updated_at,
    archived,
    fork,
  } = repository;

  const formattedUpdateTime = formatDistanceToNow(new Date(updated_at), {
    addSuffix: true,
  });

  return (
    <Card className="overflow-hidden hover:border-primary/30 transition-colors">
      <div className="flex p-4">
        <div className="mr-4 flex items-start pt-1">
          <Checkbox
            checked={isSelected}
            onChange={onToggleSelection}
            id={`repo-${id}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <div className="flex items-center mb-2 md:mb-0">
              <h3 className="text-lg font-medium mr-2 truncate">{name}</h3>
              {isPrivate ? <PrivateBadge /> : <PublicBadge />}
              {archived && (
                <Badge variant="warning" className="ml-2">
                  Archived
                </Badge>
              )}
              {fork && (
                <Badge variant="secondary" className="ml-2">
                  Fork
                </Badge>
              )}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <div className="flex items-center mr-4">
                <Star className="h-4 w-4 mr-1" />
                <span>{stargazers_count}</span>
              </div>
              <div className="flex items-center mr-4">
                <GitFork className="h-4 w-4 mr-1" />
                <span>{forks_count}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formattedUpdateTime}</span>
              </div>
            </div>
          </div>

          {description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              <img
                src={owner.avatar_url}
                alt={owner.login}
                className="w-5 h-5 rounded-full mr-2"
              />
              <span className="text-sm">{owner.login}</span>
            </div>

            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 mr-2"
                onClick={() => window.open(html_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>

              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RepositoryCard;
