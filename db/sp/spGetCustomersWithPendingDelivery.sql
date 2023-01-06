DROP PROCEDURE IF EXISTS spGetCustomersWithPendingDelivery;

delimiter //

CREATE PROCEDURE spGetCustomersWithPendingDelivery
               (
                 OUT errorcode		INT, 
                 OUT errormsg		VARCHAR(512),
                     _companyid		VARCHAR(32),
                     _userid        INT
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

/*
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;
*/

    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;

 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

    SELECT 		c.*,
    			a.id as "home_addressid", a.address1 as "home_address1", a.address2 as "home_address2", a.address3 as "home_address3", a.city as "home_city", a.state as "home_state", a.pin as "home_pin", a.phone1 as "home_phone1", a.email1 as "home_email1", a.phone2 as "home_phone2", a.email2 as "home_email2",
                s.id as "ship_addressid", s.address1 as "ship_address1", s.address2 as "ship_address2", s.address3 as "ship_address3",
                s.city as "ship_city", s.state as "ship_state", s.pin as "ship_pin", s.phone1 as "ship_phone1", s.phone2 as "ship_phone2",
                s.email1 as "ship_email1", s.email2 as "ship_email2",b.id as "bill_addressid", b.address1 as "bill_address1", b.address2 as "bill_address2", b.address3 as "bill_address3",
                b.city as "bill_city", b.state as "bill_state", b.pin as "bill_pin", b.phone1 as "bill_phone1", b.phone2 as "bill_phone2",
                b.email1 as "bill_email1", b.email2 as "bill_email2", t.name as "typename",
                r.id as "transporter_id", r.name as "transporter_name", r.code as "transporter_code", r.sysstatuses_id as "transporter_statusid",
                m.id as "term_id", m.code as term_code, m.description as "term_description", m.sysstatuses_id as "term_statusid",
                u.first_name as first_name, u.last_name as last_name, u.statuses_id as "salesperson_statusid",
                c1.id as "agent_id", c1.name as agent_name, c1.sysstatuses_id as "agent_statusid"
    FROM   companies c LEFT JOIN users u ON c.salesperson_id = u.id 
           LEFT JOIN companies c1 ON c.agents_id = c1.id 
           LEFT JOIN company_types t ON c.companytypes_id = t.id 
           LEFT JOIN transporters r ON c.transporters_id = r.id
           LEFT JOIN payment_terms m ON c.payment_terms_id = m.id
           , addresses a, addresses s, addresses b
    WHERE  c.parent_id = CASE WHEN _companyid = 1 THEN c.parent_id ELSE _companyid END
    AND    c.syscompanytypes_id           = 4702
    AND    c.addresses_id                 = a.id
    AND    c.ship_addresses_id            = s.id
    AND    c.bill_addresses_id            = b.id
    AND    EXISTS (SELECT 1 FROM packing_slips p, orders o WHERE p.orders_id = o.id AND p.syspackingslipstatuses_id = 5200 AND o.customers_id = c.id)
    AND    CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
    									(
    									 		SELECT c1.id
    									 		FROM   companies c1, users u
    									 		WHERE  c1.syscompanytypes_id = 4702
												AND    c1.salesperson_id     = _userid
												AND    u.id                  = _userid
												AND    u.sysroles_id         = 4004
												AND    u.companies_id        = _companyid
												AND    c1.parent_id          = _companyid
												UNION ALL
    									 		SELECT c1.id
    									 		FROM   companies c1, users u, companies a
    									 		WHERE  c1.syscompanytypes_id = 4702
												AND    c1.agents_id          = a.id
												AND    u.id                  = _userid
												AND    u.sysroles_id         = 4005
												AND    u.companies_id        = a.id
												AND    c1.parent_id          = _companyid
												UNION ALL
    									 		SELECT c1.id
    									 		FROM   companies c1, users u
    									 		WHERE  c1.syscompanytypes_id = 4702
												AND    u.id                  = _userid
												AND    u.sysroles_id         IN (4002,4003)
												AND    u.companies_id        = _companyid
												AND    c1.parent_id          = _companyid
                                                UNION ALL -- super admin for api
                                                SELECT c2.id
                                                FROM   companies c2
                                                WHERE  c2.syscompanytypes_id = 4702
                                                AND    EXISTS ( SELECT  1 
                                                                FROM    companies c1, users u
                                                                WHERE   c1.id                 = u.companies_id
                                                                AND     u.id                  = _userid
                                                                AND     u.companies_id        = _companyid
                                                                AND     u.sysroles_id         IN (4000)
                                                        )
												UNION ALL
												SELECT -1
    									 ) 
    	ORDER BY c.name;

END;
// 
delimiter ;