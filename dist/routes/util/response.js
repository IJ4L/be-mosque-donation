import { jsonContent } from "stoker/openapi/helpers";
const successResponse = (title, data) => {
    return jsonContent({ message: "Successfully added news", data: data }, title);
};
export default successResponse;
