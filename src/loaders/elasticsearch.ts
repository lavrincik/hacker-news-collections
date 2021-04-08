import { Client } from "@elastic/elasticsearch";
import config from "../configs";

const elasticsearchClient = new Client({ node: config.elasticsearch.url });
export default elasticsearchClient;