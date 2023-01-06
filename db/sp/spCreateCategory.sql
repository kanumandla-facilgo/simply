DROP PROCEDURE IF EXISTS spCreateCategory;

delimiter //

CREATE PROCEDURE spCreateCategory
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _companyid      INT,
                 	 _code           VARCHAR(16),
                 	 _name           VARCHAR(32),
                 	 _parentid       INT,
                 	 _imageurl       VARCHAR(256),
                 	 _ishidden       INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound    INT;
 	DECLARE  l_name        VARCHAR(32);
 	DECLARE  l_lineage     VARCHAR(256);
 	DECLARE  l_lineagename VARCHAR(1024);
 
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

 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

 	-- validate name
 	IF (SELECT EXISTS (SELECT 1 FROM categories WHERE companies_id = _companyid AND name = _name)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Category with same name already exists!';
		LEAVE main;
	
	END IF;

	IF _parentid = -1 THEN
		SELECT c.id
		INTO   _parentid
		FROM   categories c
		WHERE  c.is_root      = 1
		AND    c.companies_id = _companyid;
	END IF;

    -- get the next agent code
    CALL spGetNextSequence(errorcode, errormsg, _code, _companyid, 20070, 20073, 20071, TRIM(UPPER(_code)));

 	SET _code = TRIM(UPPER(_code));

 	IF (SELECT EXISTS (SELECT 1 FROM categories WHERE companies_id = _companyid AND code = _code)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Code already exists!';
		LEAVE main;
	
	END IF;
	
	IF _parentid IS NULL THEN

		SET errorcode  = -101;
		SET errormsg   = 'Parent ID must be passed!';
		LEAVE main;
	
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = _parentid AND c.companies_id = _companyid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Parent ID not found!';
		LEAVE main;
	
	END IF;

 	IF (SELECT EXISTS (SELECT 1 FROM categories c WHERE c.id = _parentid AND c.companies_id = _companyid AND is_leaf = true AND children_count > 0)) THEN

		SET errorcode  = -203;
		SET errormsg   = 'Product already exists!';
		LEAVE main;
	
	END IF;

	SELECT lineage, lineage_name, name
	INTO   l_lineage, l_lineagename, l_name
	FROM   categories c
	WHERE  c.id            = _parentid 
	AND    c.companies_id  = _companyid;
	
	IF l_lineage = '' THEN
		SET l_lineage = '|';
	END IF;
	
	IF l_lineagename = '' THEN
		SET l_lineagename = '~';
	END IF;

	INSERT INTO categories (name, accounting_key, code, lineage, lineage_name, is_leaf, is_root, parent_id, children_count, companies_id, is_hidden, image_url, created, last_updated)
	VALUES (_name, '', _code, CONCAT(l_lineage, _parentid, '|'), CONCAT(l_lineagename, l_name, '~'), true, false, _parentid, 0, _companyid, _ishidden, _imageurl, now(), now());

	SELECT LAST_INSERT_ID()
	INTO   id;

	UPDATE categories
	SET    children_count = children_count + 1,
	       is_leaf        = 0,
	       last_updated   = NOW()
	WHERE  categories.id  = _parentid;

END;
// 
delimiter ;
