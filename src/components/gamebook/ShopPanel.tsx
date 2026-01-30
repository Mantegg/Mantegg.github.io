import { ShoppingCart, Coins } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopConfig, ItemDef } from '@/types/gamebook';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ShopPanelProps {
  shop: ShopConfig;
  currentPageId: number | string;
  playerCurrency: number;
  playerInventory: string[];
  shopInventories: Record<string, Record<string, number>>;
  getItemDetails: (itemId: string) => ItemDef | undefined;
  onPurchase: (itemId: string, price: number) => void;
}

export function ShopPanel({
  shop,
  currentPageId,
  playerCurrency,
  playerInventory,
  shopInventories,
  getItemDetails,
  onPurchase,
}: ShopPanelProps) {
  const pageIdStr = String(currentPageId);
  const shopStock = shopInventories[pageIdStr] || {};

  const canAfford = (price: number) => playerCurrency >= price;
  const getStock = (itemId: string, originalQty?: number) => {
    if (originalQty === undefined) return undefined; // Unlimited
    return shopStock[itemId] !== undefined ? shopStock[itemId] : originalQty;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Market
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          Your {shop.currency}: <span className="font-bold">{playerCurrency}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {shop.items.map((shopItem) => {
            const item = getItemDetails(shopItem.itemId);
            const stock = getStock(shopItem.itemId, shopItem.quantity);
            const isOutOfStock = stock !== undefined && stock <= 0;
            const canBuy = canAfford(shopItem.price) && !isOutOfStock;

            return (
              <TooltipProvider key={shopItem.itemId}>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium cursor-help">
                            {item?.name || shopItem.itemId}
                          </span>
                        </TooltipTrigger>
                        {item?.description && (
                          <TooltipContent>
                            <p className="max-w-xs">{item.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      {item?.type && (
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {shopItem.price}
                      </span>
                      {stock !== undefined && (
                        <span className="text-xs">
                          Stock: {stock}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onPurchase(shopItem.itemId, shopItem.price)}
                        disabled={!canBuy}
                      >
                        Buy
                      </Button>
                    )}
                  </div>
                </div>
              </TooltipProvider>
            );
          })}
        </div>
        {shop.items.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No items available for sale.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
