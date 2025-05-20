-- This SQL script creates the user table for the User Service of the XWZ LTD Parking System.
-- It stores the details of users, including their first names, last names, email addresses, passwords, and roles.
-- The table is designed to support user authentication and authorization within the system.

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY,
  "firstName" VARCHAR(50) NOT NULL,
  "lastName" VARCHAR(50) NOT NULL,
  "email" VARCHAR(100) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(20) NOT NULL DEFAULT 'user'
);


-- This SQL script creates the parking table for the Parking Service of the XWZ LTD Parking System.
-- It stores the details of parking lots, including their codes, names, available spaces, locations, and charging fees.
-- The table is designed to support the management of parking spaces and their availability.

CREATE TABLE "parkings" (
  "code" VARCHAR(10) PRIMARY KEY,
  "parkingName" VARCHAR(100) NOT NULL,
  "availableSpaces" INTEGER NOT NULL,
  "location" VARCHAR(100) NOT NULL,
  "chargingFeePerHour" DECIMAL(10, 2) NOT NULL
);



-- Transaction Service      
-- This SQL script creates the transaction table for the Transaction Service of the XWZ LTD Parking System.
-- It stores the details of parking transactions, including entry and exit times, charged amounts, and user information.

-- This SQL script creates the transaction table for the Transaction Service of the XWZ LTD Parking System.
-- It stores the details of parking transactions, including entry and exit times, charged amounts, and user information.

CREATE TABLE "transactions" (
  "id" UUID PRIMARY KEY,
  "plateNumber" VARCHAR(20) NOT NULL,
  "parkingCode" VARCHAR(10) REFERENCES "parkings"("code"),
  "entryDateTime" TIMESTAMP NOT NULL,
  "exitDateTime" TIMESTAMP,
  "chargedAmount" DECIMAL(10, 2) DEFAULT 0,
  "userId" UUID REFERENCES "users"("id")
);