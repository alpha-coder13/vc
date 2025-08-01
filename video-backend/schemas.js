// CREATE database vc;

// USE vc;

// CREATE TABLE vc_user_login (
// username VARCHAR(50) NOT NULL ,
// id VARCHAR(255) NOT NULL PRIMARY KEY,
// secret_key VARCHAR(255) NOT NULL
// ); 	

// DESC vc_user_login;
// ALTER TABLE vc_user_details MODIFY COLUMN mobile VARCHAR(11); -- alter table | why mobile number in not allowed in int

// CREATE TABLE vc_user_details (
// first_name VARCHAR(50),
// last_name VARCHAR(50),
// email VARCHAR(225) NOT NULL,
// mobile INT NOT NULL
// );