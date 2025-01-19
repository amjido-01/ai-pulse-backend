"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
function dropAllTables() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Dropping all tables...");
            yield db_1.default.$executeRawUnsafe(`
      DO $$ DECLARE
        table_name TEXT;
      BEGIN
        FOR table_name IN
          (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS "' || table_name || '" CASCADE';
        END LOOP;
      END $$;
    `);
            console.log("All tables dropped successfully.");
        }
        catch (error) {
            console.error("Error dropping tables:", error);
        }
        finally {
            yield db_1.default.$disconnect();
        }
    });
}
dropAllTables();
//# sourceMappingURL=deleteAllData.js.map