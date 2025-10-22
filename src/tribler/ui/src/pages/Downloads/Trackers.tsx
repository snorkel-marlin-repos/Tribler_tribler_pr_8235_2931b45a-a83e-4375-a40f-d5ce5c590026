import { useState } from "react";
import toast from 'react-hot-toast';
import SimpleTable from "@/components/ui/simple-table";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { translateHeader } from "@/lib/utils";
import { Download } from "@/models/download.model";
import { Tracker } from "@/models/tracker.model ";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { triblerService } from "@/services/tribler.service";
import { isErrorDict } from "@/services/reporting";
import { useTranslation } from "react-i18next";


interface TrackerRow extends Tracker {
    recheckButton: typeof Button;
    removeButton: typeof Button;
}

export default function Trackers({ download }: { download: Download }) {
    const { t } = useTranslation();

    const [trackerDialogOpen, setTrackerDialogOpen] = useState<boolean>(false);
    const [trackerInput, setTrackerInput] = useState('');

    const trackerColumns: ColumnDef<TrackerRow>[] = [
        {
            accessorKey: "url",
            header: translateHeader('Name'),
        },
        {
            accessorKey: "status",
            header: translateHeader('Status'),
        },
        {
            accessorKey: "peers",
            header: translateHeader('Peers'),
        },
        {
            header: "",
            accessorKey: "recheckButton",
            cell: (props) => {
                    return (["[DHT]", "[PeX]"].includes(props.row.original.url) ? <></> :
                        <Button variant="secondary" className="max-h-6" onClick={(event) => {
                            triblerService.forceCheckDownloadTracker(download.infohash, props.row.original.url).then((response) => {
                                if (response === undefined) {
                                    toast.error(`${"ToastErrorTrackerCheck"} ${"ToastErrorGenNetworkErr"}`);
                                } else if (isErrorDict(response)){
                                    toast.error(`${"ToastErrorTrackerCheck"} ${response.error}`);
                                }
                            });
                        }}>{t("ForceRecheck")}</Button>)
            }
        },
        {
            header: "",
            accessorKey: "removeButton",
            cell: (props) => {
                    return (["[DHT]", "[PeX]"].includes(props.row.original.url) ? <></> :
                        <Button variant="secondary" className="max-h-6" onClick={(event) => {
                            triblerService.removeDownloadTracker(download.infohash, props.row.original.url).then((response) => {
                                if (response === undefined) {
                                    toast.error(`${"ToastErrorTrackerRemove"} ${"ToastErrorGenNetworkErr"}`);
                                } else if (isErrorDict(response)){
                                    toast.error(`${"ToastErrorTrackerRemove"} ${response.error}`);
                                } else {
                                    download.trackers = download.trackers.filter(tracker => {return tracker.url != props.row.original.url});
                                    var button = event.target as HTMLButtonElement;
                                    button.disabled = true;
                                    button.classList.add("cursor-not-allowed");
                                    button.classList.add("opacity-50");
                                }
                            });
                        }}>❌</Button>)
            }
        }
    ]

    return (
        <div>
            <div className="flex-col items-center grid-cols-1">
                <SimpleTable data={download.trackers as TrackerRow[]} columns={trackerColumns} />
                <div className="flex-none h-1 min-h-1 max-h-1 bg-secondary"></div>
                <Button className="flex-none mx-4 my-2 min-w-24 max-h-8" variant="secondary" onClick={() => {setTrackerDialogOpen(true)}}>{t('Add')}</Button>
            </div>
            <Dialog open={trackerDialogOpen} onOpenChange={setTrackerDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('TrackerDialogHeader')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-1 py-4 text-sm">
                        {t('TrackerDialogInputLabel')}
                        <div className="grid grid-cols-6 items-center gap-4">
                            <Input
                                id="uri"
                                className="col-span-5 pt-0"
                                value={trackerInput}
                                onChange={(event) => setTrackerInput(event.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="submit"
                            onClick={() => {
                                if (trackerInput) {
                                    triblerService.addDownloadTracker(download.infohash, trackerInput).then((response) => {
                                        if (response === undefined) {
                                            toast.error(`${"ToastErrorTrackerAdd"} ${"ToastErrorGenNetworkErr"}`);
                                        } else if (isErrorDict(response)){
                                            toast.error(`${"ToastErrorTrackerAdd"} ${response.error}`);
                                        }
                                    });
                                    setTrackerDialogOpen(false);
                                }
                            }}>
                            {t('Add')}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                {t('Cancel')}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
