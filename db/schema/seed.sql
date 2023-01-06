insert into sysroles values (4000, 'Administrator - System Root', 0, now(), now());
insert into sysroles values (4001, 'Other user - System Root', 0, now(), now());

-- customer roles
insert into sysroles values (4002, 'Administrator', 0, now(), now());
insert into sysroles values (4003, 'User', 0, now(), now());
insert into sysroles values (4004, 'Sales Person', 0, now(), now());
insert into sysroles values (4005, 'Agent Admin', 0, now(), now());

-- customer's customer roles
insert into sysroles values (4030, 'Customer Administrator', 0, now(), now());
insert into sysroles values (4031, 'Customer User', 0, now(), now());

-- status
insert into syssyncstatuses values (4100, 'Pending', 'Record pending sync', now(), now());
insert into syssyncstatuses values (4101, 'Synced', 'Record synced', now(), now());
insert into syssyncstatuses values (4102, 'Error', 'Error occurred while sync', now(), now());
insert into syssyncstatuses values (4103, 'Do Not Sync', 'Do not sync', now(), now());
insert into syssyncstatuses values (4104, 'Processing', 'Processing', now(), now());       
insert into syssyncstatuses values (4105, 'Completed', 'Completed', now(), now());
insert into syssyncstatuses values (4106, 'Cancelled', 'Cancelled', now(), now());


insert into sysorderstatuses values (4200, 'Open', 'Order is pending fulfillment', now(), now());
insert into sysorderstatuses values (4201, 'In Packing', 'Order is being worked upon in backoffice', now(), now());
insert into sysorderstatuses values (4202, 'Completed', 'Order is completed', now(), now());
insert into sysorderstatuses values (4203, 'Pending Approval', 'Order is Pending Approval', now(), now());
insert into sysorderstatuses values (4204, 'Rejected', 'Order is Rejected', now(), now());
insert into sysorderstatuses values (4205, 'Cancelled', 'Order is Cancelled', now(), now());

insert into syspermissiongroups values (4300, 'Orders', now(), now());
insert into syspermissiongroups values (4301, 'Users', now(), now());
insert into syspermissiongroups values (4302, 'Roles', now(), now());
insert into syspermissiongroups values (4303, 'Products', now(), now());

insert into syspermissiongroups values (4501, 'Users', now(), now());
insert into syspermissiongroups values (4502, 'Roles', now(), now());
insert into syspermissiongroups values (4503, 'Companies', now(), now());

insert into sysstatuses values (4600, 'Active', now(), now());
insert into sysstatuses values (4601, 'Disabled', now(), now());
insert into sysstatuses values (4602, 'Deleted', now(), now());

insert into syspricelevels values (4800, 'Flat Price', now(), now());
insert into syspricelevels values (4801, 'Product', now(), now());
insert into syspricelevels values (4802, 'Price Group', now(), now());

insert into sysproducttypes values (4900, 'Kit', now(), now());
insert into sysproducttypes values (4901, 'Item', now(), now());
insert into sysproducttypes values (4902, 'Credit', now(), now());

insert into sysworkflowtypes values (5000, 'Quote price variance', now(), now());
insert into sysworkflowtypes values (5001, 'Payment due', now(), now());
insert into sysworkflowtypes values (5002, 'Credit due', now(), now());

insert into sysworkflowstatuses values (5100, 'Pending Approval', now(), now());
insert into sysworkflowstatuses values (5101, 'Approved', now(), now());
insert into sysworkflowstatuses values (5102, 'Endorsed', now(), now());
insert into sysworkflowstatuses values (5103, 'Rejected', now(), now());
insert into sysworkflowstatuses values (5104, 'Timed out', now(), now());
insert into sysworkflowstatuses values (5105, 'Cancelled', now(), now());

insert into syspackingslipstatuses values (5200, 'Pending Invoice', 'Goods are packed in Bale. Pending Invoice creation.', now(), now());
insert into syspackingslipstatuses values (5201, 'Dispatched', 'Dispatched', now(), now());
insert into syspackingslipstatuses values (5202, 'Completed', 'Completed', now(), now());
insert into syspackingslipstatuses values (5203, 'Cancelled', 'Cancelled', now(), now());
INSERT INTO syspackingslipstatuses VALUES (5204, 'Pending Dispatch', 'Invoice created. Waiting for Tempo.', NOW(), NOW());


insert into sysinvoicestatuses values (5300, 'Created', 'Invoice Created', now(), now());
insert into sysinvoicestatuses values (5301, 'Completed', 'Invoice sent with LR updated', now(), now());

insert into sysjournalentrytype values (5400, 'Stock Entry', 'Stock creation', now(), now());
insert into sysjournalentrytype values (5401, 'Packing slip Entry', 'Packing slip creation', now(), now());
insert into sysjournalentrytype values (5402, 'Packing slip cancellation', 'Packing slip cancellation', now(), now());

insert into sysdeliverynotestatuses values (5500, 'Pending LR', now(), now());
insert into sysdeliverynotestatuses values (5501, 'Transported', now(), now());
insert into sysdeliverynotestatuses values (5502, 'Completed', now(), now());
insert into sysdeliverynotestatuses values (5503, 'Cancelled', now(), now());

INSERT INTO sysdeliverystatuses VALUES (5700, 'Pending', NOW(), NOW());
INSERT INTO sysdeliverystatuses VALUES (5701, 'Partially Delivered', NOW(), NOW());
INSERT INTO sysdeliverystatuses VALUES (5702, 'Delivered', NOW(), NOW());
INSERT INTO sysdeliverystatuses VALUES (5703, 'Cancelled', NOW(), NOW());

INSERT INTO sysproducthsn (id, code, name, description, short_code, created, last_updated)
VALUES        (6000, '5205', '5205 - Fabric', 'Fabric, Towel', '5205', now(), now()),
              (6001, '5208', '5208 - Fabric', 'Fabric, Towel', '5208', now(), now()),
              (6002, '6302', '6302 - Bath', 'Bath', '6302', now(), now()),
              (6003, '6304', '6304 - Bedlinen', 'Bedlinen', '6304', now(), now()),
              (6004, '9404-Cottom', '9404 - Cotton', 'Bedlinen', '9404', now(), now()),
              (6005, '9404-NonCotton', '9404 - NonCotton', 'Comforter', '9404', now(), now()),
              (6007, '5208-Towelling', '5208 - Towelling', 'Towelling', '5208', now(), now()),
              (6008, '6307', '6307 - Cotton', 'Cotton', '6307', now(), now()),
              (0, '0000', '0000 - No Tax', 'No Tax HSN', '0000', now(), now()),
              (6009, '5703', '5703 - Floor Coverings', 'Carpet and Floor Coverings', '5703', now(), now()),
              (6010, '52082270', '52082270 - Plan Weave', 'Plain weave, weighing more than 100 g/m2: Sheeting', '52082270', now(), now()),
              (6011, '520811', '520811 - bleach < 100', '520811 - Bleach < 100', '520811', now(), now()),
              (6012, '520812', '520811 - bleach 100 to 200', '520812 - Bleach 100 to 200', '520812', now(), now()),
              (6013, '520831', '520831 - dyed < 100', '520831 - Dyed < 100', '520831', now(), now()),
              (6014, '520832', '520832 - dyed 100 to 200', '520832 - Dyed 100 to 200', '520832', now(), now()),
              (6015, '520841', '520841 - printed Yarn < 100', '520841 - Printed Yarn < 100', '520841', now(), now()),
              (6016, '520842', '520842 - printed Yarn 100 to 200', '520842 - Printed Yarn 100 to 200', '520842', now(), now()),
              (6017, '520851', '520851 - printed < 100', '520851 - Printed < 100', '520851', now(), now()),
              (6018, '520852', '520852 - printed 100 to 200', '520852 - Printed 100 to 200', '520852', now(), now()),
              (6019, '63041910', '63041910 - bed sheet and cover', '63041910 - bed sheet and bed cover', '63041910', now(), now()),
              (6020, '63041920', '63041920 - bedspread or silk', '63041920 - bedspread or silk', '63041920', now(), now()),
              (6021, '630411', '630411 - bedspread knitted or crocheted', '63041911 - bedspread knitted or crocheted', '630411', now(), now()),
              (6022, '63049250', '63049250 - terry towel knitted or croch', '63049250 - terry towel knitted or croch', '63049250', now(), now()),
              (6023, '63049280', '63049280 - cushion cover', '63049280 - cushion cover', '63049280', now(), now()),
              (6024, '630260', '630260 - toilet/kitchen linen of terry towelling', '63049280 - toilet linen and kitchen linen of terry towelling', '630260', now(), now());

INSERT INTO sysproducthsn_details (sysproducthsn_id, amount_min, amount_max, tax_percent_gst, tax_percent_cess, tax_percent_igst, tax_percent_sgst, tax_percent_cgst, activation_start_date, activation_end_date, created, last_updated)
VALUES        (6000, 0, null, 5.00, 0.00, 5.00, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6001, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6002, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6003, 0, 999.99, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6003, 1000, null, 12.00, 0.00, 12.0, 6, 6, '2018-01-01', NULL, now(), now()),
              (6004, 0, 999.99, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6004, 1000, null, 12.00, 0.00, 12.0, 6, 6, '2018-01-01', NULL, now(), now()),
              (6005, 0, null, 18.00, 0.00, 18.00, 9.00, 9.00, '2018-01-01', NULL, now(), now()),
              (6007, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6008, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (0, 0, null, 0, 0, 0, 0, 0, '2018-01-01', null, now(), now()),
              (6009, 0, null, 5.00, 0.00, 5.00, 2.5, 2.5, '2021-01-01', NULL, now(), now()),
              (6010, 0, null, 5.00, 0.00, 5.00, 2.5, 2.5, '2021-01-01', NULL, now(), now()),
              (6011, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6012, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6013, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6014, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6015, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6016, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6017, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6018, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6019, 0, 999.99, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6019, 1000, null, 12.00, 0.00, 12.0, 6, 6, '2018-01-01', NULL, now(), now()),
              (6020, 0, 999.99, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6020, 1000, null, 12.00, 0.00, 12.0, 6, 6, '2018-01-01', NULL, now(), now()),
              (6021, 0, 999.99, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6021, 1000, null, 12.00, 0.00, 12.0, 6, 6, '2018-01-01', NULL, now(), now()),
              (6022, 0, 999.99, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6022, 1000, null, 12.00, 0.00, 12.0, 6, 6, '2018-01-01', NULL, now(), now()),
              (6023, 0, 999.99, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
              (6023, 1000, null, 12.00, 0.00, 12.0, 6, 6, '2018-01-01', NULL, now(), now()),
              (6024, 0, null, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now());

insert into sysconfigurationtypes values (6000, 'System', now(), now());
insert into sysconfigurationtypes values (6001, 'Company', now(), now());
insert into sysconfigurationtypes values (6002, 'User', now(), now());

insert into sysconfigurations values (7000, 'system_version_number', 'System Version Number', '0.00', '0.00', 6000, 0, 0, 0, now(), now());

insert into sysconfigurations values (10000, 'logo_url', 'Company Logo URL', '-', 'upload/logo_simplytextile.png', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (10001, 'bank_name', 'Company Bank Name', '', 'Test Bank', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10002, 'bank_account_number', 'Company Bank Account #', '', 'TESTAE00000000', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10003, 'bank_isfc', 'Company Bank ISFC #', '', 'TESTU000000', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10004, 'tax_cst_number', 'Company CST #', '', 'TEST11112222', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10005, 'tax_vat_number', 'Company VAT #', '', 'TEST44445555', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10006, 'tax_pan_number', 'Company PAN #', '', 'TEST77778888', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10007, 'product_new_show_x_days', 'Show new Product for X days', '', 15, 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (10008, 'tax_gst_number', 'Company GST #', '', 'TEST77778888', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10009, 'product_allow_non_hidden_out_of_stock_while_packing', 'Allow negative quantity for items out of stock and still being displayed (do not hide if out of stock)', '0, 1', 0, 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10010, 'display_records_per_page', 'number of records to be displayed per page', '1,0', '20', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10011, 'new_product_days', 'Duration for tagging product as new', '1,0', '0', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10012, 'new_category_days', 'Duration for tagging category as new', '1,0', '0', 6001, 0, 1, 7, now(), now());

insert into sysconfigurations values (11000, 'mail_server_name', 'Mail Server Name', 'gmail', 'gmail', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11001, 'mail_server_host', 'Mail Server host', 'gmail', 'gmail', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11002, 'mail_server_port', 'Mail Server port', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11003, 'mail_server_user', 'Mail Server username', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11004, 'mail_server_pass', 'Mail Server password', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11005, 'mail_server_is_secure', 'Mail Server secure', 'true', 'true', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11006, 'mail_server_email_from', 'From Email Address', '', '', 6001, 0, 0, 7, now(), now());

insert into sysconfigurations values (15000, 'tax_auto_calculation_order', 'If 1, Tax will be calculated by system. Tax field will be disabled.', '1,0', '0', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (15001, 'tax_error_match_taxable_lineitems', 'If auto_tax_calc is 0 and this config is 1, error will be thrown if no line item is taxable and tax is entered at header.', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (15002, 'agent_bonus_commission', 'Agent bonus commission', '1,0', '0', 6001, 0, 1, 7, now(), now());

insert into sysconfigurations values (20000, 'order_number_required', 'Company Order # Required', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20001, 'order_number_next_value', 'Company Next Order #', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20002, 'order_number_format', 'Company Order # format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20003, 'order_number_edit_allowed', 'Order # edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20010, 'packing_slip_number_required', 'Company Packing Slip # Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20011, 'packing_slip_number_next_value', 'Company Next Packing Slip #', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20012, 'packing_slip_number_format', 'Company Packing Slip # format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20013, 'packing_slip_number_edit_allowed', 'Packing Slip # edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20020, 'delivery_note_number_required', 'Company Delivery Note # Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20021, 'delivery_note_number_next_value', 'Company Next Delivery Note #', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20022, 'delivery_note_number_format', 'Company Delivery Number # format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20023, 'delivery_note_number_edit_allowed', 'Delivery note # edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20030, 'customer_code_required', 'Company Customer Code Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20031, 'customer_code_next_value', 'Company Customer Code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20032, 'customer_code_format', 'Company Customer Code format', '%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20033, 'customer_code_edit_allowed', 'Customer Code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20040, 'gate_pass_number_required', 'Company Gate Pass # Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20041, 'gate_pass_number_next_value', 'Company Next Gate Pass #', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20042, 'gate_pass_number_format', 'Company Gate Pass # format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20043, 'gate_pass_number_edit_allowed', 'Gate Pass # edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20050, 'transporter_code_required', 'Company Transporter code Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20051, 'transporter_code_next_value', 'Company Next Transporter code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20052, 'transporter_code_format', 'Company Transporter code format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20053, 'transporter_code_edit_allowed', 'Transporter code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20060, 'agent_code_required', 'Company Agent code Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20061, 'agent_code_next_value', 'Company Next Agent code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20062, 'agent_code_format', 'Company Agent code format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20063, 'agent_code_edit_allowed', 'Agent code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20070, 'category_code_required', 'Company Category code Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20071, 'category_code_next_value', 'Company Next Category code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20072, 'category_code_format', 'Company Category code format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20073, 'category_code_edit_allowed', 'Category code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20080, 'product_code_required', 'Company Product code Required', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20081, 'product_code_next_value', 'Company Next Product code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20082, 'product_code_format', 'Company Product code format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20083, 'product_code_edit_allowed', 'Product code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (25001, 'module_approval_rate_diff', 'approval module rate diff', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25002, 'module_approval_payment_due', 'approval module payment due', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25003, 'module_approval_credit_limit', 'approval module credit limit', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (25050, 'module_payment_terms', 'If business has 30/60/90 day payment term', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25051, 'module_rate_categories', 'if one product has multiple rates', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25052, 'module_catalog_share', 'Catalog Share', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25053, 'module_transporters', 'Module Transporters', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25054, 'module_agents', 'Module Agents', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25055, 'module_orders', 'Module Order', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25056, 'module_inventory', 'Module Inventory', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25057, 'module_users', 'Module Users', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25058, 'module_customers', 'Module Customers', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25059, 'module_reports', 'Module Reports', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25060, 'module_outstanding', 'Module Outstanding', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25061, 'module_packing_slips', 'Module Packing Slip', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25062, 'module_delivery_notes', 'Module Delivery Notes', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25063, 'module_gate_passes', 'Module Gate Passes', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25064, 'module_customer_ship_address', 'Module Ship Address', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25065, 'module_customer_bill_address', 'Module Bill Address', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25066, 'module_customer_gst', 'Module Customer GST', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25067, 'module_customer_address', 'Module Customer Address', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25068, 'module_customer_firm', 'Module Customer working with Firm', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (25151, 'module_integration_customer', 'Customer Integration', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25152, 'module_integration_payment', 'Payment Integration', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25153, 'module_integration_invoice', 'Invoice Integration', '1,0', '0', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (25201, 'module_notification_sms', 'SMS Notification', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25202, 'module_notification_email', 'Email Notification', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (25250, 'module_agent_login', 'Module Agent Login', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25251, 'module_salesman', 'Module Agent Login', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25252, 'module_customer_login', 'Module Customer Login', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (25350, 'module_product_stock', 'Module Stock', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25351, 'module_product_kits', 'Module Kit', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25352, 'module_product_bundles', 'Module Bundle', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25353, 'module_product_product_heads', 'Module Product Head', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25354, 'module_product_multiple_units', 'Module Product multiple Unit', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25355, 'module_product_unit_restrictions', 'Product Unit Restrictions', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25356, 'module_product_hsn', 'Product HSN', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25357, 'module_product_price_groups', 'Product Price Groups', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (30000, 'order_create_cc', 'Order create CC email', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (30001, 'payment_reminder_cc', 'Payment reminder CC email', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (30002, 'module_integration_product', 'Product Integration', '1,0', '0', 6001, 0, 1, 127, now(), now());

insert into syssubscriptiontemplates values (6300, 'Platinum', 'Platinum', NOW(), NOW());
insert into syssubscriptiontemplates values (6301, 'Slim', 'Slim', NOW(), NOW());
insert into syssubscriptiontemplates values (6302, 'Payment Reminder', 'Payment Reminder', NOW(), NOW());

-- ----------------------------------------
-- Platinum (Full)
-- ----------------------------------------
insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) 
select 6300, id, default_value, now(), now()
from sysconfigurations
where sysconfigurationtypes_id = 6001;

-- ----------------------------------------
-- Slim
-- ----------------------------------------
insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) 
select 6301, id, '0', now(), now()
from sysconfigurations
where sysconfigurationtypes_id = 6001;

update syssubscriptiontemplatedetails set value = 1 
where syssubscriptiontemplates_id = 6301 
AND sysconfigurations_id in (select id from sysconfigurations where name in ('module_orders', 'module_inventory', 'module_reports'));

-- ----------------------------------------
-- payment reminder
-- ----------------------------------------
insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) 
select 6302, id, '0', now(), now()
from sysconfigurations
where sysconfigurationtypes_id = 6001;

update syssubscriptiontemplatedetails set value = 1 
where syssubscriptiontemplates_id = 6302
AND sysconfigurations_id in (select id from sysconfigurations where name in ('module_outstanding'));

-- permissions 
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5000, 'Order Create', 'Allow Order creation on customer behalf', '1,0', '1', '0', '1', '1', '1', '1', '1', 0, 1, 1, 1, 4300, now(), now()),
       (5001, 'Order Approve', 'Allow Order Approval', '1,0', '1', '0', '1', '1', '0', '0', '0', 0, 1, 0, 0, 4300, now(), now()),
       (5002, 'Cancel Order', 'Allow cancelling any order', '1,0', '1', '0', '1', '1', '0', '1', '0', 0, 1, 1, 1, 4300, now(), now()),
       (5003, 'Edit Order number', 'Allow editing order number if generated auto', '1,0', '1', '0', '1', '1', '0', '1', '0', 0, 1, 1, 1, 4300, now(), now()),
       (5102, 'User Create', 'Allow user creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4301, now(), now()),
       (5103, 'User Edit', 'Allow user edition', '1,0', '1', '0', '0', '0', '0', '1', '0', 0, 1, 0, 0, 4301, now(), now()),
       (5104, 'Role Create', 'Allow role creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4302, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5105, 'Role Edit', 'Allow role edition', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4302, now(), now()),
       (5106, 'Product Create', 'Allow product creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5107, 'Product Edit', 'Allow product edition', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5108, 'Category Create', 'Allow category creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5109, 'Category Edit', 'Allow category edition', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());
       
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5110, 'Transporter Create', 'Allow transporter creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5111, 'Transporter Edit', 'Allow transporter edition', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5112, 'Payment Term Create', 'Allow payment term creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5113, 'Payment Term Edit', 'Allow payment term edition', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
	(5114, 'Update user password', 'Update user password', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5200, 'Customer Create', 'Allow customer creation', '1,0', '1', '0', '1', '1', '0', '0', '0', 0, 1, 0, 1, 4303, now(), now()),
       (5201, 'Customer Edit', 'Allow customer edition', '1,0', '1', '0', '1', '1', '0', '0', '0', 0, 1, 0, 1, 4303, now(), now()),
       (5202, 'Customer Type Create', 'Allow customer type creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5203, 'Customer Type Edit', 'Allow customer type edition', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5204, 'Agent Create', 'Allow agent creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5205, 'Agent Edit', 'Allow agent edition', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5206, 'Customer Balance Update', 'Allow customer balance update', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5401, 'Price Group Create', 'Price Group Create', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5402, 'Price Group Edit', 'Price Group Edit', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5450, 'Workflow Setup', 'Workflow Setup', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5460, 'Change term while ordering', 'Allow changing payment term while creating order', '1,0', '1', '0', '1', '1', '0', '0', '0', 0, 1, 0, 1, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5207, 'Edit Customer Code', 'Allow editing customer code if generated auto', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5461, 'Change transporter while ordering', 'Allow changing transporter while creating order', '1,0', '1', '1', '1', '0', '0', '0', '0', 0, 1, 0, 1, 4303, now(), now()),
       (5462, 'Can change customer type', 'Allow changing customer type while creating/updating customer', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5463, 'Create Packing Slip', 'Allow creating packing slip', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5464, 'Cancel Packing Slip', 'Allow cancelling packing slip', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5466, 'Edit Packing Slip number', 'Allow editing packing slip # if generated auto', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5300, 'User Create', 'Allow creating users', '1,0', '1', '0', '0', '0', '0', '0', '0', 1, 0, 0, 0, 4501, now(), now()),
       (5301, 'User Edit', 'Allow editing users', '1,0', '1', '0', '0', '0', '0', '0', '0', 1, 0, 0, 0, 4501, now(), now()),
       (5302, 'Role Create', 'Allow role creation', '1,0', '1', '0', '0', '0', '0', '0', '0', 1, 0, 0, 0, 4502, now(), now()),
       (5303, 'Role Edit', 'Allow role edition', '1,0', '1', '0', '0', '0', '0', '0', '0', 1, 0, 0, 0, 4502, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5500, 'Create Delivery Note', 'Allow creating delivery note', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5501, 'Update Delivery Note', 'Allow updating delivery note', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5502, 'Cancel Delivery Note', 'Allow cancelling delivery note', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5503, 'View Delivery Note', 'Allow viewing delivery note', '1,0', '1', '0', '1', '1', '0', '1', '0', 0, 1, 1, 1, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5504, 'Edit Delivery Note number', 'Allow editing delivery note # if generated auto', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5505, 'Edit Delivery Note after Complete', 'Allow editing delivery note after completion', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());


insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5551, 'Create Gate Pass', 'Allow creating gate pass', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5552, 'Update Gate Pass', 'Allow updating gate pass', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5553, 'Cancel Gate Pass', 'Allow cancelling gate pass', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5554, 'View Gate Pass', 'Allow viewing gate pass', '1,0', '1', '0', '1', '1', '0', '1', '0', 0, 1, 1, 1, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5555, 'Edit Gate Pass number', 'Allow editing gate pass # if generated auto', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());


insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5465, 'View Packing Slip', 'Allow viewing packing slip', '1,0', '1', '0', '1', '1', '0', '1', '0', 0, 1, 1, 1, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5304, 'Company Create', 'Allow creating companies', '1,0', '1', '0', '0', '0', '0', '0', '0', 1, 0, 0, 0, 4503, now(), now()),
       (5470, 'Unit Create', 'Unit Create', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5471, 'Unit Update', 'Unit Update', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5600, 'View Stock', 'Allow viewing stock', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5650, 'View Receivables List', 'View Receivables List', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

-- company types
insert into company_types (id, name, description, created, last_updated) values (4700, 'My Company', 'This is me', now(), now());
insert into company_types (id, name, description, created, last_updated) values (4701, 'My Customers', 'These are my customer companies', now(), now());
insert into company_types (id, name, description, created, last_updated) values (4702, 'Customer of my Customers', 'These are my customer''s customers', now(), now());
insert into company_types (id, name, description, created, last_updated) values (4703, 'Agents of my Customers', 'These are agents of my customers', now(), now());

-- reset auto ID for company types
insert into company_types (id, name, description, created, last_updated) values (10000, 'Customer of my Customers', 'These are my customer''s customers', now(), now());

delete from company_types where id = 10000;

-- insert address

insert into addresses (address1, address2, address3, city, state, pin, phone1, email1, created, last_updated)
VALUES ('10 Tagore Park', 'Nehrunagar', 'Ambawadi', 'Ahmedabad', 'Gujarat', '380015', '79-26730323', 'rupesh.d.shah@gmail.com', now(), now());

-- insert company
insert into companies (id, name, code, description, sysstatuses_id, syscompanytypes_id, companytypes_id, tin, addresses_id, ship_addresses_id, bill_addresses_id, created, last_updated)
VALUES (1, 'abc', 'abc24', 'my company', 4600, 4700, 4700, null, last_insert_id(), last_insert_id(), last_insert_id(), now(), now());

-- now updating address record with company id
update addresses set companies_id = last_insert_id();

-- reset address auto ID
insert into addresses (id, address1, address2, address3, city, state, pin, phone1, email1, created, last_updated)
VALUES (10000, '10 Tagore Park', 'Nehrunagar', 'Ambawadi', 'Ahmedabad', 'Gujarat', '380015', '79-26730323', 'rupesh.d.shah@gmail.com', now(), now());

delete from addresses where id = 10000;

-- reset auto increment for companies
insert into companies (id, name, code, description, sysstatuses_id, syscompanytypes_id, companytypes_id, tin, addresses_id, ship_addresses_id, bill_addresses_id, created, last_updated)
VALUES (10000, 'abc', 'abc24', 'my company', 4600, 4700, 4700, null, last_insert_id(), last_insert_id(), last_insert_id(), now(), now());

delete from companies where id = 10000;

-- roles

INSERT INTO roles (name, description, companies_id, sysroles_id, created, last_updated)
VALUES ('Site Admin', 'Site Administrator', (select id from companies limit 1), 4000, now(), now());

-- create user record
CALL spCreateUser (@err, @msg, @id, 1, 'Rupesh', 'Shah', 'D', 'rshah.madmin', 'abc999', last_insert_id(), 1, null, null, null, null, null, null, null, null, null); 

INSERT INTO role_permissions (roles_id, syspermissions_id, value, created)
SELECT r.id, p.id, 1, NOW()
FROM roles r, syspermissions p
WHERE p.is_system = 1;


INSERT INTO unit_of_measures (id, name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) values (100, 'Pieces', 'PCS', 'PCS', null, 1, 1, 1, 1, null, now(), now());
INSERT INTO unit_of_measures (id, name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) values (101, 'Set', 'Set', 'Set', null, 1, 1, 1, 1, null, now(), now());
INSERT INTO unit_of_measures (id, name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) values (200, 'Milli Meter', 'Milli Meter', 'mm', null, 0, 0, 1, 1, null, now(), now());
INSERT INTO unit_of_measures (id, name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) values (201, 'Centi Meter', 'Centi Meter', 'cm', 200, 10, 1, 1, 1, null, now(), now());
INSERT INTO unit_of_measures (id, name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) values (202, 'Meter', 'Meter', 'mtr', 200, 1000, 1, 1, 1, null, now(), now());
INSERT INTO unit_of_measures (id, name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) values (300, 'Gram', 'Gram', 'gm', null, 1, 0, 1, 1, null, now(), now());
INSERT INTO unit_of_measures (id, name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) values (301, 'Kilo Gram', 'Kilo Gram', 'kg', 300, 1000, 1, 1, 1, null, now(), now());

INSERT INTO unit_of_measures (id, name, description, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) values (5000, 'Kilo Gram', 'Kilo Gram', 300, 1000, 0, 1, 1, null, now(), now());
DELETE FROM unit_of_measures where id = 5000;

INSERT INTO sysstockactiontype VALUES (5600, 'Opening Stock', NOW(), NOW());

INSERT INTO sysstockactiontype VALUES (5601, 'Purchase', NOW(), NOW());

INSERT INTO sysstockactiontype VALUES (5602, 'Sale', NOW(), NOW());

INSERT INTO sysstockactiontype VALUES (5603, 'Adjustment', NOW(), NOW());

INSERT INTO syslovgroups VALUES (1000, 'State', 1, now(), now());

INSERT INTO lov_data (description, long_description, syslovgroups_id, companies_id, created, last_updated)
VALUES 
('Andaman & Nicobar Islands', 'Andaman & Nicobar Islands', 1000, 1, now(), now()),
('Andhra Pradesh', 'Andhra Pradesh', 1000, 1, now(), now()),
('Arunachal Pradesh', 'Arunachal Pradesh', 1000, 1, now(), now()),
('Assam', 'Assam', 1000, 1, now(), now()),
('Bihar', 'Bihar', 1000, 1, now(), now()),
('Chandigarh', 'Chandigarh', 1000, 1, now(), now()),
('Chhattisgarh', 'Chhattisgarh', 1000, 1, now(), now()),
('Dadra & Nagar Haveli', 'Dadra & Nagar Haveli', 1000, 1, now(), now()),
('Daman & Diu', 'Daman & Diu', 1000, 1, now(), now()),
('Delhi', 'Delhi', 1000, 1, now(), now()),
('Goa', 'Goa', 1000, 1, now(), now()),
('Gujarat', 'Gujarat', 1000, 1, now(), now()),
('Haryana', 'Haryana', 1000, 1, now(), now()),
('Himachal Pradesh', 'Himachal Pradesh', 1000, 1, now(), now()),
('Jammu & Kashmir', 'Jammu & Kashmir', 1000, 1, now(), now()),
('Jharkhand', 'Jharkhand', 1000, 1, now(), now()),
('Karnataka', 'Karnataka', 1000, 1, now(), now()),
('Kerala', 'Kerala', 1000, 1, now(), now()),
('Lakshadweep', 'Lakshadweep', 1000, 1, now(), now()),
('Madhya Pradesh', 'Madhya Pradesh', 1000, 1, now(), now()),
('Maharashtra', 'Maharashtra', 1000, 1, now(), now()),
('Manipur', 'Manipur', 1000, 1, now(), now()),
('Meghalaya', 'Meghalaya', 1000, 1, now(), now()),
('Mizoram', 'Mizoram', 1000, 1, now(), now()),
('Nagaland', 'Nagaland', 1000, 1, now(), now()),
('Odisha', 'Odisha', 1000, 1, now(), now()),
('Puducherry', 'Puducherry', 1000, 1, now(), now()),
('Punjab', 'Punjab', 1000, 1, now(), now()),
('Rajasthan', 'Rajasthan', 1000, 1, now(), now()),
('Sikkim', 'Sikkim', 1000, 1, now(), now()),
('Tamil Nadu', 'Tamil Nadu', 1000, 1, now(), now()),
('Telangana', 'Telangana', 1000, 1, now(), now()),
('Tripura', 'Tripura', 1000, 1, now(), now()),
('Uttar Pradesh', 'Uttar Pradesh', 1000, 1, now(), now()),
('Uttarakhand', 'Uttarakhand', 1000, 1, now(), now()),
('West Bengal', 'West Bengal', 1000, 1, now(), now());

INSERT INTO syssessiontypes VALUES (4100, 'Web', 60*30, NOW(), NOW());
INSERT INTO syssessiontypes VALUES (4101, 'Mobile', 60*60*24*5, NOW(), NOW());
INSERT INTO syssessiontypes VALUES (4102, 'API', 60*30, NOW(), NOW());
INSERT INTO syssessiontypes VALUES (4103, 'One Time', 60*5, NOW(), NOW());
INSERT INTO syssessiontypes VALUES (4104, 'Mobile App', 432000, now(), now());

INSERT INTO syseventtypes VALUES ( 1001, 'Order Create', NOW(), NOW());
INSERT INTO syseventtypes VALUES ( 1002, 'Order Update', NOW(), NOW());
INSERT INTO syseventtypes VALUES ( 1003, 'Customer Share', NOW(), NOW());
INSERT INTO syseventtypes VALUES(1004, 'Agent Upload', NOW(), NOW());
INSERT INTO syseventtypes VALUES(1005, 'Customer Upload', NOW(), NOW());
INSERT INTO syseventtypes VALUES(1006, 'Transporter Upload', NOW(), NOW());
INSERT INTO syseventtypes VALUES(1007, 'Bill Upload', NOW(), NOW());
insert into syseventtypes values(1008, 'Welcome Email', NOW(), NOW());
insert into syseventtypes values(1009, 'Billing Company', NOW(), NOW());

INSERT INTO sysdocumenttypes VALUES (1001, 'Order', NOW(), NOW());
INSERT INTO sysdocumenttypes VALUES (1002, 'Category', NOW(), NOW());
INSERT INTO sysdocumenttypes VALUES (1003, 'DeliveryNotes', NOW(), NOW());
INSERT INTO sysdocumenttypes VALUES (1004, 'PackingSlips', NOW(), NOW());
INSERT INTO sysdocumenttypes VALUES (1005, 'Bill', NOW(), NOW());
INSERT INTO sysdocumenttypes VALUES (1006, 'Company', NOW(), NOW());

INSERT INTO sysuploadtypes VALUES (1001, 'Agents', NOW(), NOW());
INSERT INTO sysuploadtypes VALUES (1002, 'Customers', NOW(), NOW());
INSERT INTO sysuploadtypes VALUES (1003, 'Transporters', NOW(), NOW());
INSERT INTO sysuploadtypes VALUES (1004, 'Bills', NOW(), NOW());

INSERT INTO sysgatepassstatuses values (6200, 'Created', now(), now());
INSERT INTO sysgatepassstatuses values (6201, 'Cancelled', now(), now());
INSERT INTO sysgatepassstatuses values (6202, 'Completed', now(), now());

insert into syspaymentstatuses values (5800, 'Active', now(), now());
insert into syspaymentstatuses values (5801, 'Paid', now(), now());
insert into syspaymentstatuses values (5802, 'Partially Paid', now(), now());
insert into syspaymentstatuses values (5803, 'Deleted', now(), now());

insert into sysnotificationformats(id, name, description, created, last_updated) values (5900, 'Email', 'Email Notififaction', NOW(), NOW());
insert into sysnotificationformats(id, name, description, created, last_updated) values (5901, 'SMS', 'SMS Notififaction', NOW(), NOW());

INSERT INTO sysnotificationtypes VALUES (5801, 'Order', 'Order Create Notification', NOW(), NOW());
INSERT INTO sysnotificationtypes VALUES (5802, 'Catalog Share', 'Catalog Share Notification', NOW(), NOW());
INSERT INTO sysnotificationtypes VALUES (5803, 'Payment Reminder', 'Payment Reminder Notification', NOW(), NOW());
INSERT INTO sysnotificationtypes VALUES (5804, 'Welcome Email', 'Welcome Email Notification', NOW(), NOW());

insert into sysnotificationstatuses values (1001, 'Pending', 'Pending', now(), now());
insert into sysnotificationstatuses values (1002, 'Error', 'Error', now(), now());
insert into sysnotificationstatuses values (1003, 'Delivered', 'Delivered', now(), now());
insert into sysnotificationstatuses values (1004, 'Undelivered', 'Undelivered', now(), now());

insert into sysbillingpartners values(1001, 'Simply', 'S#12121212', MD5(CONCAT('A9074#321', '78778778878787', 'Arihant')), now(), now());
insert into sysbillingpartners values(1002, 'SimplyReminders', 'SR#34343434', MD5(CONCAT('A9074#321', '64664664464646', 'Arihant')), now(), now());
insert into sysbillingpartners values(1003, 'SimplyRetail', 'SRE#81818181', MD5(CONCAT('A9074#321', '29229229929292', 'Arihant')), now(), now());

insert into sysbillingrenewals values(2001, 'Yearly', 'Yearly', NOW(), NOW());

insert into sysbillingpackagetypes values(3001, 'Token', 'Token', NOW(), NOW());

/*
-- get distinct UOM
SELECT u.*
FROM   products p, unit_of_measures u
WHERE  p.unit_of_measures_id = u.id
AND    p.id = 1
UNION 
SELECT u.*
FROM   products p, unit_conversions c, unit_of_measures u
WHERE  p.price_groups_id = c.price_groups_id
AND    c.from_uom_id    = u.id
AND    p.id = 1
UNION
SELECT u.*
FROM   products p, unit_conversions c, unit_of_measures u
WHERE  p.price_groups_id = c.price_groups_id
AND    c.to_uom_id    = u.id
AND    p.id = 1

-- get price
SELECT unit_of_measures_id, 1 AS qty, unit_price
FROM   price_lists l
WHERE  l.price_groups_id     = 10010
AND    l.company_types_id    = 10001
AND    l.unit_of_measures_id = 5005
AND    1 BETWEEN l.qty_from AND l.qty_to; 
UNION
SELECT c.to_uom_id, 1unit_price
FROM   price_lists l, unit_conversions c
WHERE  l.price_groups_id     = 10010
AND    l.company_types_id    = 10001
AND    l.unit_of_measures_id = 5005
AND    1 BETWEEN l.qty_from AND l.qty_to
AND    l.unit_of_measures_id = l.from_uom_id; 

UNION
SELECT u.*
FROM   products p, unit_conversions c, unit_of_measures u
WHERE  p.price_groups_id = c.price_groups_id
AND    c.to_uom_id    = u.id
AND    p.id = 1

SELECT to_uom_id 

1 set 3 than
1 than 40 meters 


1 meter 40 rs.

-- first find if price is available directly
select l.unit_of_measures_id, 1 AS qty, l.unit_price
FROM   price_lists l, companies c, products p
WHERE  l.unit_of_measures_id = 5005 
AND    l.company_types_id    = c.companytypes_id
AND    c.id                  = 10006 
AND    c.syscompanytypes_id  = 4702
AND    l.price_groups_id     = p.price_groups_id
AND    p.id                  = 1 

	select l.unit_of_measures_id, 1 AS qty, l.unit_price
	FROM   price_lists l, companies c, products p
	WHERE  l.unit_of_measures_id = 5005 -- [UOM]
	AND    l.company_types_id    = c.companytypes_id
	AND    c.id                  = 10006 -- [CUSTOMERID]
	AND    l.price_groups_id     = p.price_groups_id
	AND    c.syscompanytypes_id  = 4702
	AND    p.id                  = 1 --[PRODUCTID]
	AND    p.price_groups_id     = l.price_groups_id

-- second find if there is direct conversions







update unit_converstions_rows
set unit_converstions_rows.to_qty = 
from unit_converstions_rows t1
WHERE t1.
AND NOT EXISTS (SELECT 1 
                FROM unit_conversions c 
                WHERE unit_conversion_rows.from_uom_id = c.from_uom_id 
                and  unit_conversion_rows.to_uom_id = c.to_uom_id 
                )
                
SELECT * FROM unit_conversion_rows 
WHERE NOT EXISTS (SELECT 1 
                FROM unit_conversions c 
                WHERE unit_conversion_rows.from_uom_id = c.from_uom_id 
                and  unit_conversion_rows.to_uom_id = c.to_uom_id 
                )


create table unit_conversion_rows (price_groups_id int, from_uom_id int, from_qty decimal(10,4), to_uom_id int, to_qty decimal(10,4), updated_flag int);

-- insert all combinations
insert into unit_conversion_details (price_groups_id, from_uom_id, from_qty, to_uom_id, to_qty, updated_flag, created, last_updated)
select 10013, f.from_uom_id, f.from_qty, t.to_uom_id, t.to_qty, 0, now(), now()
from unit_conversions f, unit_conversions t 
where f.price_groups_id = 10013 
and t.price_groups_id = 10013
and f.from_uom_id <> t.to_uom_id;

update unit_conversion_details
set updated_flag = 1, last_updated = now()
where price_groups_id = 10013
and exists (SELECT 1 
                FROM unit_conversions c 
                WHERE unit_conversion_details.from_uom_id = c.from_uom_id 
                and  unit_conversion_details.to_uom_id = c.to_uom_id 
                and  unit_conversion_details.price_groups_id = c.price_groups_id
                );

-- somehow inner queries return dup rows. fix that 
update unit_conversion_details, (
 select u1.price_groups_id, ucr.from_uom_id, ucr.to_uom_id, (u1.to_qty * u2.to_qty) / (u1.from_qty * u2.from_qty) as to_qty
 from unit_conversions u1, unit_conversions u2, (
  SELECT from_uom_id, to_uom_id FROM unit_conversion_details 
  WHERE price_groups_id = 10013
  AND NOT EXISTS (SELECT 1 
                FROM unit_conversions c 
                WHERE unit_conversion_details.from_uom_id = c.from_uom_id 
                and  unit_conversion_details.to_uom_id = c.to_uom_id 
                and  unit_conversion_details.price_groups_id = c.price_groups_id
                )
 ) ucr
 where u1.from_uom_id = ucr.from_uom_id
 and u2.to_uom_id = ucr.to_uom_id
 and u1.to_uom_id = u2.from_uom_id
 and u1.price_groups_id = 10013
 and u2.price_groups_id = 10013) u1
set unit_conversion_details.from_qty = 1,
    unit_conversion_details.to_qty = u1.to_qty,
    unit_conversion_details.updated_flag = 1,
    unit_conversion_details.last_updated = now()
where unit_conversion_details.price_groups_id = u1.price_groups_id
AND unit_conversion_details.from_uom_id = u1.from_uom_id
and unit_conversion_details.to_uom_id = u1.to_uom_id
and unit_conversion_details.updated_flag = 0;

update unit_conversion_details ucr, unit_conversion_details u1, unit_conversion_details u2
set ucr.from_qty = 1,
    ucr.to_qty = (u1.to_qty * u2.to_qty) / (u1.from_qty * u2.from_qty),
    ucr.updated_flag = 2,
    ucr.last_updated = now()
 where ucr.updated_flag = 0
 and u1.updated_flag = 1
 and u2.updated_flag = 1
 and ucr.from_uom_id = u1.from_uom_id
 and u1.to_uom_id = u2.from_uom_id
 and u2.to_uom_id = ucr.to_uom_id
 and u1.price_groups_id = 10013
 and u2.price_groups_id = 10013
 and ucr.price_groups_id = 10013;

 delete from unit_conversion_details where updated_flag = 0;

*/