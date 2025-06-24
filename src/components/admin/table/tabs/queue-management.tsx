import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Phone, Users, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// แก้ไขการนำเข้า interface จาก table.interface เป็น queue.interface
import { QueueItem, NewQueueInput } from "@/interfaces/queue.interface";

interface QueueManagementProps {
  queue: QueueItem[];

  queueDialogOpen: boolean;
  setQueueDialogOpen: (open: boolean) => void;
  newQueue: NewQueueInput;
  setNewQueue: (queue: NewQueueInput) => void;
  handleAddQueue: () => void;
  handleSeatQueue: (queueId: string) => void;
  handleCancelQueue: (queueId: string) => void;
  getStatusBadgeStyle: (status: string) => string;
  getStatusText: (status: string) => string;
  getTimeAgo: (dateString: string) => string;
}

export function QueueManagement({
  queue,
  queueDialogOpen,
  setQueueDialogOpen,
  newQueue,
  setNewQueue,
  handleAddQueue,
  handleSeatQueue,
  handleCancelQueue,
  getStatusBadgeStyle,
  getStatusText,
  getTimeAgo,
}: QueueManagementProps) {
  // Add all possible statuses to avoid TS error (e.g., 'notified' or others)
  const statusOrder: Record<string, number> = {
    waiting: 0,
    seated: 1,
    cancelled: 2,
    notified: 3,
  };
  const sortedQueue = [...queue].sort((a, b) => {
    const statusDiff =
      (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    // ถ้า status เหมือนกัน ให้เรียงตามเวลา requestedAt จากน้อยไปมาก (คิวเก่าก่อน)
    return (
      new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
    );
  });
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-foreground">คิวลูกค้า</h2>
        <Dialog open={queueDialogOpen} onOpenChange={setQueueDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มคิว
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-center text-foreground">
                เพิ่มคิวใหม่
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                กรอกข้อมูลลูกค้าที่ต้องการจองคิว
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name" className="text-foreground">
                  ชื่อลูกค้า *
                </Label>
                <Input
                  id="party-name"
                  value={newQueue.partyName}
                  onChange={(e) =>
                    setNewQueue({
                      ...newQueue,
                      partyName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-number" className="text-foreground">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="contact-info"
                  value={newQueue.contactInfo}
                  onChange={(e) =>
                    setNewQueue({
                      ...newQueue,
                      contactInfo: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="party-size" className="text-foreground">
                  จำนวนคน *
                </Label>
                <Input
                  id="party-size"
                  type="number"
                  min="1"
                  value={newQueue.partySize}
                  onChange={(e) =>
                    setNewQueue({
                      ...newQueue,
                      partySize: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkin-time" className="text-foreground">
                  เวลาเช็คอิน *
                </Label>
                <Input
                  id="requested-at"
                  type="time"
                  value={newQueue.requestedAt}
                  onChange={(e) =>
                    setNewQueue({
                      ...newQueue,
                      requestedAt: e.target.value, // store as "HH:mm"
                    })
                  }
                  className="bg-background border-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setQueueDialogOpen(false)}
                className="flex-1 border-input text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleAddQueue}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                เพิ่มคิว
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedQueue.map((queueItem) => (
          <motion.div
            key={queueItem._id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
          >
            <Card className="shadow-lg bg-card border-0 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-light text-card-foreground">
                    {queueItem.partyName}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-0 font-medium",
                      getStatusBadgeStyle(queueItem.status)
                    )}
                  >
                    {getStatusText(queueItem.status)}
                  </Badge>
                </div>
                <CardDescription>
                  คิวเมื่อ: {getTimeAgo(queueItem.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 flex-grow">
                <div className="space-y-2">
                  {queueItem.contactInfo && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-card-foreground">
                        {queueItem.contactInfo}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-card-foreground">
                      {queueItem.partySize} คน
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-card-foreground">
                      เวลา:{" "}
                      {new Date(queueItem.requestedAt).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 mt-auto">
                {queueItem.status === "waiting" ? (
                  <div className="w-full flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-300 text-green-700 hover:bg-green-600 hover:text-primary-foreground dark:border-green-600 dark:text-green-400 dark:hover:bg-green-600 dark:hover:text-primary-foreground"
                      onClick={() => handleSeatQueue(queueItem._id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      นั่งแล้ว
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-600 hover:text-primary-foreground dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-primary-foreground"
                      onClick={() => handleCancelQueue(queueItem._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary" className="w-full text-center">
                    {queueItem.status === "seated" ? "นั่งแล้ว" : "คิวยกเลิก"}
                  </Badge>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {queue.length === 0 && (
        <div className="text-center py-16">
          <Clock className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">ยังไม่มีคิวลูกค้า</p>
        </div>
      )}
    </>
  );
}
