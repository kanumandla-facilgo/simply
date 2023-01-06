DROP PROCEDURE IF EXISTS spCreateCustomFilter;

delimiter //

CREATE PROCEDURE `spCreateCustomFilter`(
                 OUT errorcode        INT, 
                 OUT errormsg         VARCHAR(512),
                 OUT id               INT,
					 _companies_id	  INT,
					 _users_id		  INT,
                 	 _name            VARCHAR(32),
                     _filters  		  VARCHAR(256),
                     _documenttype    INT,
                     _isuserdefined   TINYINT,
                     _showindashboard TINYINT
                     
               )
    DETERMINISTIC
BEGIN

 	DECLARE  l_notfound   INT;

 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;

/*
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END; */


    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;

 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

	-- add custom filter
	INSERT INTO custom_filters (companies_id, users_id, name, filters, is_user_defined, show_in_dashboard, sysdocumenttypes_id, created, last_updated) 
	VALUES (_companies_id, _users_id, _name, _filters, _isuserdefined, _showindashboard, _documenttype, NOW(), NOW());

	SELECT LAST_INSERT_ID()
	INTO   id;

END
// 
delimiter ;
