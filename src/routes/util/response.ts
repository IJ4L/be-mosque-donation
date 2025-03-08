import { jsonContent } from "stoker/openapi/helpers";

const successResponse = (title: string, data: any) => {
    return jsonContent({ message: "Successfully added news", data: data }, title); 
};

export default successResponse;