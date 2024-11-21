
DELETE FROM "Products" WHERE "Id" <= 32;
ALTER SEQUENCE "Products_Id_seq" RESTART 33;
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(1, 'Nghi 1', '2024-10-16 07:00:00.000', 'None', false, NULL, 'EL001', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(2, 'Định 1', '2024-10-16 07:00:00.000', 'None', false, 1, 'EL002', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(3, 'Định 2', '2024-10-16 07:00:00.000', 'None', false, 2, 'EL003', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(4, 'Định 12', '2024-10-16 07:00:00.000', 'None', false, 30, 'EL004', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(5, 'Định 13', '2024-10-16 07:00:00.000', 'None', false, 30, 'EL005', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(6, 'Sơn 1', '2024-10-16 07:00:00.000', 'None', false, 1, 'EL006', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(7, 'Dan', '2024-10-16 07:00:00.000', 'None', false, 1, 'EL007', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(8, 'Nghi 2', '2024-10-16 07:00:00.000', 'None', false, 1, 'EL008', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(9, 'Phương 1', '2024-10-16 07:00:00.000', 'None', false, 1, 'EL009', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(10, 'Sơn 2', '2024-10-16 07:00:00.000', 'None', false, 6, 'EL010', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(11, 'Phương 2', '2024-10-16 07:00:00.000', 'None', false, 9, 'EL011', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(12, 'Nghi 3', '2024-10-16 07:00:00.000', 'None', false, 8, 'EL012', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(13, 'Định 6', '2024-10-16 07:00:00.000', 'None', false, 2, 'EL013', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(14, 'Định 10', '2024-10-16 07:00:00.000', 'None', false, 2, 'EL014', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(15, 'Nghi 4', '2024-10-16 07:00:00.000', 'None', false, 8, 'EL015', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(16, 'Định 8', '2024-10-16 07:00:00.000', 'None', false, 13, 'EL016', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(17, 'Định 7', '2024-10-16 07:00:00.000', 'None', false, 13, 'EL017', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(18, 'Quang', '2024-10-16 07:00:00.000', 'None', false, 2, 'EL018', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(19, 'Sơn 3', '2024-10-16 07:00:00.000', 'None', false, 6, 'EL019', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(20, 'Phương 4', '2024-10-16 07:00:00.000', 'None', false, 9, 'EL020', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(21, 'Sơn 4', '2024-10-16 07:00:00.000', 'None', false, 6, 'EL021', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(22, 'Nghi 5', '2024-10-16 07:00:00.000', 'None', false, 8, 'EL022', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(23, 'Định 4', '2024-10-16 07:00:00.000', 'None', false, 3, 'EL023', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(24, 'Định 9', '2024-10-16 07:00:00.000', 'None', false, 13, 'EL024', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(25, 'Định 11', '2024-10-16 07:00:00.000', 'None', false, 14, 'EL025', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(26, 'Định 5', '2024-10-16 07:00:00.000', 'None', false, 3, 'EL026', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(27, 'Quang 1', '2024-10-16 07:00:00.000', 'None', false, NULL, 'EL027', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(28, 'Quang 2', '2024-10-16 07:00:00.000', 'None', false, 18, 'EL028', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(29, 'Tý', '2024-10-16 07:00:00.000', 'None', false, 14, 'EL029', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(30, 'Định 3', '2024-10-16 07:00:00.000', 'None', false, 3, 'EL030', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(31, 'Phương 3', '2024-10-16 07:00:00.000', 'None', false, 9, 'EL031', 'e10adc3949ba59abbe56e057f20f883e');
INSERT INTO "Collaborators"
("Id", "Name", "BeginDate", "Rank", "IsSale", "ParentId", "UserName", "Password")
VALUES(32, 'Sơn 5', '2024-10-16 07:00:00.000', 'None', false, 6, 'EL032', 'e10adc3949ba59abbe56e057f20f883e');

DELETE FROM "Users" WHERE "Id" <= 33;
ALTER SEQUENCE "Users_Id_seq" RESTART 34;
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(2, 'EL001', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Nghi 1', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(3, 'EL002', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 1', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(4, 'EL003', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 2', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(5, 'EL004', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 12', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(6, 'EL005', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 13', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(7, 'EL006', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Sơn 1', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(8, 'EL007', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Dan', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(9, 'EL008', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Nghi 2', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(10, 'EL009', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Phương 1', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(11, 'EL010', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Sơn 2', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(12, 'EL011', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Phương 2', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(13, 'EL012', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Nghi 3', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(14, 'EL013', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 6', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(15, 'EL014', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 10', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(16, 'EL015', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Nghi 4', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(17, 'EL016', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 8', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(18, 'EL017', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 7', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(19, 'EL018', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Quang', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(20, 'EL019', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Sơn 3', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(21, 'EL020', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Phương 4', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(22, 'EL021', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Sơn 4', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(23, 'EL022', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Nghi 5', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(24, 'EL023', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 4', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(25, 'EL024', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 9', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(26, 'EL025', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 11', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(27, 'EL026', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 5', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(28, 'EL027', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Quang 1', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(29, 'EL028', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Quang 2', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(30, 'EL029', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Tý', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(31, 'EL030', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Định 3', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(32, 'EL031', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Phương 3', 'Sale');
INSERT INTO "Users"
("Id", "UserName", "Password", "RoleId", "DisplayName", "ApplicationType")
VALUES(33, 'EL032', 'e10adc3949ba59abbe56e057f20f883e', NULL, 'Sơn 5', 'Sale');