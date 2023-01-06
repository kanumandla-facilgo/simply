DROP PROCEDURE IF EXISTS spCreateWorkflowHierarchy;

DELIMITER //

CREATE  PROCEDURE `spCreateWorkflowHierarchy`(
                 OUT errorcode      INT, 
                 OUT errormsg       VARCHAR(512),
				 INOUT _id			INT,
				_companies_id	 	INT,
				_roles_id			INT,
				_variance_over		DECIMAL(8, 2),
				_credit_days_over 	INT,
				_credit_over		INT,
				_to_roles_id			INT
               )
    DETERMINISTIC

main: BEGIN

	DECLARE  l_from_sys_role_type_id  INT;
	DECLARE  l_to_sys_role_type_id  INT;
	DECLARE  l_notfound             INT;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

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

	IF (_roles_id = _to_roles_id) THEN
		SET errorcode  = -105;
		SET errormsg   = 'Role and Reports To cannot be same.';
		LEAVE main;
	END IF;

	SELECT sysroles_id
	INTO   l_from_sys_role_type_id
	FROM   roles
	WHERE  id = _roles_id
	AND    companies_id = _companies_id;

	SELECT sysroles_id
	INTO   l_to_sys_role_type_id
	FROM   roles
	WHERE  id = _to_roles_id
	AND    companies_id = _companies_id;

/*
	-- This restriction is not needed right now. So commenting out ..
	IF 	(l_to_sys_role_type_id = 4005 AND l_from_sys_role_type_id NOT IN (4030, 4031)) then
		SET errorcode  = -110;
		SET errormsg   = 'Agent can only receive orders from customers for approvals.';
		LEAVE main;
	END IF;
*/

	IF 	(l_to_sys_role_type_id IN (4030, 4031)) then
		SET errorcode  = -115;
		SET errormsg   = 'Customers cannot receive orders for approvals.';
		LEAVE main;
	END IF;

IF _id > 0 THEN
	UPDATE `workflow_hierarchies`
	SET
	
	`companies_id` = _companies_id,
	`roles_id` = _roles_id,
	`variance_over` = _variance_over,
	`credit_days_over` = _credit_days_over,
	`credit_over` = _credit_over,
	`to_roles_id` = _to_roles_id,
	`last_updated` = now()
	WHERE 
	workflow_hierarchies.id = _id;
ELSE
	INSERT INTO `workflow_hierarchies`
	(
	`companies_id`,
	`roles_id`,
	`variance_over`,
	`credit_days_over`,
	`credit_over`,
	`to_roles_id`,
	`created`,
	`last_updated`)
	VALUES
	(_companies_id,_roles_id, _variance_over, _credit_days_over, _credit_over, _to_roles_id, now(), now());
	
	SELECT LAST_INSERT_ID() INTO _id;

END IF;	
END;
// 
delimiter ;
