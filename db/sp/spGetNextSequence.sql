DROP PROCEDURE IF EXISTS spGetNextSequence;

delimiter //

CREATE PROCEDURE spGetNextSequence
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT code            VARCHAR(32),
                     _companyid      INT,
                     _typeconfigid   INT,
                     _editonconfigid INT,
                     _valueconfigid  INT,
                     _inputcode      VARCHAR(32)
               )

READS SQL DATA

main: BEGIN

    DECLARE  l_notfound         INT;
    DECLARE  l_is_auto_number   VARCHAR(64);
    DECLARE  l_is_code_edit_on  VARCHAR(64);
    DECLARE  l_code             VARCHAR(32);

    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
        SET errorcode = @errno;
        ROLLBACK;
    END;

    SET errorcode  = 0;
    SET errormsg   = 'Success';

    SET l_code = NULL;
    
    SELECT value
    INTO   l_is_auto_number
    FROM   configurations
    WHERE  sysconfigurations_id = _typeconfigid
    AND    companies_id         = _companyid;

    IF l_is_auto_number = '0' THEN

        IF _inputcode IS NOT NULL AND _inputcode != '' THEN

            SELECT value
            INTO   l_is_code_edit_on
            FROM   configurations
            WHERE  sysconfigurations_id = _editonconfigid
            AND    companies_id         = _companyid;

            IF l_is_code_edit_on = '1' THEN

                SET l_code = _inputcode;

            END IF;

        END IF;

        IF l_code IS NULL THEN

            SELECT value
            INTO   l_code
            FROM   configurations
            WHERE  sysconfigurations_id = _valueconfigid
            AND    companies_id         = _companyid
            FOR    UPDATE;

            UPDATE configurations
            SET    value = l_code + 1
            WHERE  sysconfigurations_id = _valueconfigid
            AND    companies_id         = _companyid;

        END IF;

    ELSE

        SET l_code = _inputcode;

    END IF;

    SET code = l_code;

END
//
DELIMITER ;