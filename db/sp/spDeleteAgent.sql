DROP PROCEDURE IF EXISTS spDeleteAgent;

delimiter //

CREATE PROCEDURE spDeleteAgent
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _agentid        INT,
                     _userid         INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound    INT;
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
		ROLLBACK;
	END;

/*
    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;
*/
 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

	IF (SELECT NOT EXISTS (SELECT 1 FROM companies c WHERE c.id = _agentid AND c.parent_id = _companyid AND c.syscompanytypes_id = 4703)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Agent not found. Cannot delete the agent!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.id = _agentid AND c.parent_id = _companyid AND c.syscompanytypes_id = 4703 AND c.is_system_agent_id = 1)) THEN

		SET errorcode  = -204;
		SET errormsg   = 'System Agent cannot be deleted!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.agents_id = _agentid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Customers found for this agent. Cannot delete the agent!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM customer_shares c WHERE c.companies_id = _agentid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'You have shared categories/products with this agent. Cannot delete the agent!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM sessions s, users u WHERE s.users_id = u.id AND u.companies_id = _agentid)) THEN

		SET errorcode  = -203;
		SET errormsg   = 'Agent user has logged in to the app. Cannot delete the aegnt!';
		LEAVE main;

	END IF;

	-- delete the agent user
	DELETE FROM users WHERE companies_id = _agentid;

	-- delete the agent company record
	DELETE FROM companies WHERE id = _agentid;

END;
// 
delimiter ;
