import { Breadcrumbs, BreadcrumbsItem } from "@heroui/react";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Breadcrumbs className="text-sm mb-6">
      {items.map((item, i) =>
        item.onClick ? (
          <BreadcrumbsItem key={i} onPress={item.onClick}>
            {item.label}
          </BreadcrumbsItem>
        ) : (
          <BreadcrumbsItem key={i} className="text-muted">
            {item.label}
          </BreadcrumbsItem>
        )
      )}
    </Breadcrumbs>
  );
}
