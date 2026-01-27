import { GamebookData, Choice, Page } from '@/types/gamebook';
import { ValidationError } from '@/types/builder';
import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MiniMap,
  NodeTypes,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, ShoppingCart, AlertCircle } from 'lucide-react';

interface VisualEditorProps {
  gamebookData: GamebookData;
  selectedPageId: number | string | null;
  onSelectPage: (pageId: number | string) => void;
  onAddChoice: (pageId: number | string, choice: Choice) => void;
  onUpdateChoice: (pageId: number | string, choiceIndex: number, updates: Partial<Choice>) => void;
  errors: ValidationError[];
}

// Custom Page Node Component
const PageNode = ({ data }: { data: any }) => {
  const hasErrors = data.errors && data.errors.length > 0;
  const isSelected = data.isSelected;
  const isStart = data.isStart;
  
  // Determine node color based on page type
  let borderColor = 'border-border';
  let bgColor = 'bg-card';
  
  if (data.hasCombat) {
    borderColor = 'border-red-500';
    bgColor = 'bg-red-50 dark:bg-red-950/20';
  } else if (data.hasShop) {
    borderColor = 'border-green-500';
    bgColor = 'bg-green-50 dark:bg-green-950/20';
  } else {
    borderColor = 'border-blue-500';
    bgColor = 'bg-blue-50 dark:bg-blue-950/20';
  }
  
  if (isSelected) {
    borderColor = 'border-primary ring-2 ring-primary';
  }
  
  if (hasErrors) {
    borderColor = 'border-destructive ring-2 ring-destructive';
  }
  
  if (isStart) {
    borderColor = 'border-yellow-500 ring-2 ring-yellow-500';
  }

  return (
    <Card className={`min-w-[180px] max-w-[220px] ${borderColor} ${bgColor} border-2 transition-all cursor-pointer hover:shadow-lg`}>
      {/* Input handle on the left */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs text-muted-foreground mb-1">
              Page {data.pageId}
            </div>
            {data.title && (
              <div className="font-semibold text-sm truncate">
                {data.title}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {isStart && <Badge variant="default" className="text-[10px] px-1 py-0">START</Badge>}
            {data.hasCombat && <Sword className="h-4 w-4 text-red-500" />}
            {data.hasShop && <ShoppingCart className="h-4 w-4 text-green-500" />}
            {hasErrors && <AlertCircle className="h-4 w-4 text-destructive" />}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground line-clamp-2">
          {data.text ? data.text.replace(/<[^>]+>/g, '').substring(0, 80) : 'No text'}
        </div>
        
        {data.choiceCount > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {data.choiceCount} choice{data.choiceCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </CardContent>
      
      {/* Output handle on the right */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </Card>
  );
};

// Define node types outside component to avoid recreation
const nodeTypes: NodeTypes = {
  pageNode: PageNode,
};

export const VisualEditor = ({
  gamebookData,
  selectedPageId,
  onSelectPage,
  errors,
}: VisualEditorProps) => {
  // Generate nodes and edges from gamebook data with tree layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const pages = gamebookData.pages || [];
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Build adjacency list to understand page connections
    const pageMap = new Map<string, Page>();
    const childrenMap = new Map<string, Set<string>>();
    pages.forEach(page => {
      const pageIdStr = String(page.id);
      pageMap.set(pageIdStr, page);
      childrenMap.set(pageIdStr, new Set());
    });

    // Find all connections
    pages.forEach(page => {
      const pageIdStr = String(page.id);
      page.choices?.forEach(choice => {
        const targetId = choice.nextPageId || choice.to;
        if (targetId) {
          const targetIdStr = String(targetId);
          if (pageMap.has(targetIdStr)) {
            childrenMap.get(pageIdStr)?.add(targetIdStr);
          }
        }
        if (choice.combat) {
          if (choice.combat.winPageId) {
            const winIdStr = String(choice.combat.winPageId);
            if (pageMap.has(winIdStr)) {
              childrenMap.get(pageIdStr)?.add(winIdStr);
            }
          }
          if (choice.combat.losePageId) {
            const loseIdStr = String(choice.combat.losePageId);
            if (pageMap.has(loseIdStr)) {
              childrenMap.get(pageIdStr)?.add(loseIdStr);
            }
          }
        }
      });
    });

    // Calculate tree layout positions with improved spacing
    const positions = new Map<string, { x: number; y: number; level: number }>();
    const visited = new Set<string>();
    const levelCounts = new Map<number, number>();
    const levelMaxY = new Map<number, number>(); // Track the maximum Y position per level

    const calculatePosition = (pageIdStr: string, level: number, parentY: number = 0) => {
      if (visited.has(pageIdStr)) return;
      visited.add(pageIdStr);

      const currentCount = levelCounts.get(level) || 0;
      const currentMaxY = levelMaxY.get(level) || 0;
      
      // Improved spacing: use max of parentY and current level max to avoid overlaps
      const y = Math.max(parentY, currentMaxY);
      
      levelCounts.set(level, currentCount + 1);
      levelMaxY.set(level, y + 250); // Reserve vertical space for this node

      const x = level * 400; // Increased horizontal spacing

      positions.set(pageIdStr, { x, y, level });

      const children = Array.from(childrenMap.get(pageIdStr) || []);
      
      // Sort children to maintain consistent layout
      children.sort((a, b) => {
        const pageA = pageMap.get(a);
        const pageB = pageMap.get(b);
        return (pageA?.id || 0) > (pageB?.id || 0) ? 1 : -1;
      });
      
      // Calculate positions for children with proper vertical spacing
      let childY = y;
      children.forEach((childId) => {
        calculatePosition(childId, level + 1, childY);
        const childPos = positions.get(childId);
        if (childPos) {
          childY = childPos.y + 250; // Space out children vertically
        }
      });
    };

    // Start from page 1 (root of tree)
    const startPage = pages[0];
    if (startPage) {
      calculatePosition(String(startPage.id), 0, 0);
    }

    // Place any unvisited pages (disconnected nodes)
    pages.forEach((page, index) => {
      const pageIdStr = String(page.id);
      if (!positions.has(pageIdStr)) {
        // Place disconnected nodes to the far right
        const orphanLevel = (levelMaxY.size || 0) + 2;
        const orphanCount = levelCounts.get(orphanLevel) || 0;
        positions.set(pageIdStr, {
          x: orphanLevel * 400,
          y: orphanCount * 250,
          level: orphanLevel,
        });
        levelCounts.set(orphanLevel, orphanCount + 1);
      }
    });

    // Create nodes with tree positions
    pages.forEach((page: Page, index: number) => {
      const pageErrors = errors.filter(e => String(e.pageId) === String(page.id));
      const hasCombat = page.choices?.some(c => c.combat) || false;
      const hasShop = !!page.shop;
      const isStart = index === 0 || page.id === 1;
      const pageIdStr = String(page.id);
      const pos = positions.get(pageIdStr) || { x: 0, y: index * 250, level: 0 };
      
      nodes.push({
        id: String(page.id),
        type: 'pageNode',
        position: { x: pos.x, y: pos.y },
        data: {
          pageId: page.id,
          title: page.title,
          text: page.text,
          choiceCount: page.choices?.length || 0,
          hasCombat,
          hasShop,
          isStart,
          isSelected: String(page.id) === String(selectedPageId),
          errors: pageErrors,
        },
      });

      // Create edges for each choice
      page.choices?.forEach((choice: Choice, choiceIndex: number) => {
        const targetId = choice.nextPageId || choice.to;
        if (targetId) {
          const edgeId = `${page.id}-${choiceIndex}-${targetId}`;
          const isCombatEdge = !!choice.combat;
          
          edges.push({
            id: edgeId,
            source: String(page.id),
            target: String(targetId),
            label: choice.text?.replace(/<[^>]+>/g, '').substring(0, 20) + (choice.text && choice.text.replace(/<[^>]+>/g, '').length > 20 ? '...' : ''),
            animated: isCombatEdge,
            type: 'default', // Changed from smoothstep for better routing
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isCombatEdge ? '#ef4444' : '#3b82f6',
            },
            style: { 
              stroke: isCombatEdge ? '#ef4444' : '#3b82f6',
              strokeWidth: 2,
            },
            labelStyle: { 
              fontSize: 10, 
              fill: '#666',
              fontWeight: 500,
            },
            labelBgStyle: { 
              fill: '#fff', 
              fillOpacity: 0.8,
            },
            // Add offset for multiple edges between same nodes
            sourceHandle: null,
            targetHandle: null,
          });
        }

        // Add edges for combat win/lose pages
        if (choice.combat) {
          if (choice.combat.winPageId) {
            edges.push({
              id: `${page.id}-combat-win-${choice.combat.winPageId}`,
              source: String(page.id),
              target: String(choice.combat.winPageId),
              label: '✓ Victory',
              animated: true,
              type: 'default',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#22c55e',
              },
              style: { 
                stroke: '#22c55e',
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
              labelStyle: { 
                fontSize: 10, 
                fill: '#22c55e',
                fontWeight: 600,
              },
              labelBgStyle: { 
                fill: '#fff', 
                fillOpacity: 0.9,
              },
            });
          }
          if (choice.combat.losePageId) {
            edges.push({
              id: `${page.id}-combat-lose-${choice.combat.losePageId}`,
              source: String(page.id),
              target: String(choice.combat.losePageId),
              label: '✗ Defeat',
              animated: true,
              type: 'default',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#ef4444',
              },
              style: { 
                stroke: '#ef4444',
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
              labelStyle: { 
                fontSize: 10, 
                fill: '#ef4444',
                fontWeight: 600,
              },
              labelBgStyle: { 
                fill: '#fff', 
                fillOpacity: 0.9,
              },
            });
          }
        }
      });
    });

    return { nodes, edges };
  }, [gamebookData.pages, selectedPageId, errors]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const pageId = node.data.pageId;
    onSelectPage(pageId);
  }, [onSelectPage]);

  if (!gamebookData.pages || gamebookData.pages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            No pages to visualize. Create pages to see the graph.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data.isStart) return '#eab308';
            if (node.data.errors?.length > 0) return '#ef4444';
            if (node.data.hasCombat) return '#ef4444';
            if (node.data.hasShop) return '#22c55e';
            return '#3b82f6';
          }}
          maskColor="rgb(240, 240, 240, 0.6)"
        />
      </ReactFlow>
    </div>
  );
};
