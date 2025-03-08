import db from "../../db/index.ts";
import { donations } from "../../db/schema.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import { parseDonationsFormData } from "../util/parse-data.ts";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { CreateRoute, GetRoute } from "./donations.routes.ts";
import sendWhatsAppMessage from "../../middlewares/wa-gateway.ts";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
    const donation = await parseDonationsFormData(c);
    if (!donation) {
        return c.json({ message: "Invalid donation", data: null }, HttpStatusCodes.BAD_REQUEST);
    }

    const sendWAMessage = sendWhatsAppMessage("081241438052", `New donation from ${donation.donaturName} with amount ${donation.donationAmount}`);
    if (!sendWAMessage) {
        return c.json({ message: "Error creating donation", data: null }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }

    const result = await db.insert(donations).values(donation).returning();
    return c.json({message: "Donation Created", data: result[0] }, HttpStatusCodes.OK);
}

export const get: AppRouteHandler<GetRoute> = async (c) => {
    const donation = await db.select().from(donations);
    return c.json({ message: "Donations retrieved", data: donation }, HttpStatusCodes.OK);
}